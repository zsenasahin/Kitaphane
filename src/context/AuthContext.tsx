import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/types';

// WebBrowser authentication listener completion
WebBrowser.maybeCompleteAuthSession();

export interface SignUpResult {
  needsEmailVerification: boolean;
  user: User | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username: string
  ) => Promise<{ result: SignUpResult | null; error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  verifyOtp: (
    email: string,
    token: string,
    type?: 'signup' | 'recovery' | 'email'
  ) => Promise<{ error: string | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  updateUserPassword: (password: string) => Promise<{ error: string | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Türkçe hata mesajı çevirici
export const formatAuthError = (err: any): string => {
  if (!err) return 'Bilinmeyen bir hata oluştu.';
  const msg = typeof err === 'string' ? err : err.message || '';

  if (
    msg.includes('email_provider_disabled') ||
    msg.includes('Email logins are disabled')
  ) {
    return "Supabase panelinde 'Email' sağlayıcısı kapatılmış. Lütfen Supabase -> Authentication -> Providers -> Email bölümünden 'Enable Email provider' seçeneğini AÇIK (Enable) yapın.";
  }
  if (msg.includes('Invalid login credentials')) {
    return 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'E-posta adresiniz henüz doğrulanmamış. Lütfen onay kodunu girin.';
  }
  if (msg.includes('User already registered')) {
    return 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Şifreniz en az 6 karakter uzunluğunda olmalıdır.';
  }
  if (msg.includes('Token has expired') || msg.includes('Token is expired')) {
    return 'Doğrulama kodunun süresi dolmuş. Lütfen yeni kod talep edin.';
  }
  if (msg.includes('Invalid token') || msg.includes('Token is invalid')) {
    return 'Girdiğiniz doğrulama kodu geçersiz. Lütfen kontrol edin.';
  }
  if (
    msg.includes('Unsupported provider') ||
    msg.includes('provider is not enabled')
  ) {
    return 'Google ile giriş Supabase panelinizde henüz aktif edilmemiş. Supabase Dashboard -> Authentication -> Providers -> Google bölümünden Client ID & Secret eklemeniz gerekmektedir.';
  }
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
    return 'Çok fazla e-posta isteği yapıldı (Supabase limiti). Lütfen biraz bekleyin veya spam kutunuzu kontrol edin.';
  }
  if (msg.includes('Network request failed')) {
    return 'İnternet bağlantısı kurulamadı. Lütfen bağlantınızı kontrol edin.';
  }

  return msg || 'İşlem sırasında bir hata oluştu.';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch or create user profile
  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      } else {
        // Yeni profil oluştur
        const initialProfile: Partial<Profile> = {
          id: currentUser.id,
          username:
            currentUser.user_metadata?.username ||
            currentUser.email?.split('@')[0] ||
            'okur',
          full_name:
            currentUser.user_metadata?.full_name ||
            currentUser.email?.split('@')[0] ||
            'Okur',
          avatar_url: currentUser.user_metadata?.avatar_url || null,
          onboarding_completed: false,
          reading_goal_yearly: 12,
          reading_frequency: 'Haftada birkaç gün',
          favorite_genres: ['Roman', 'Edebiyat'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert(initialProfile)
          .select()
          .maybeSingle();

        if (created) {
          setProfile(created as Profile);
        } else if (insertError) {
          console.warn('Profile create note:', insertError.message);
          setProfile(initialProfile as Profile);
        }
      }
    } catch (e) {
      console.warn('fetchProfile error:', e);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  // Auth State Listener
  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        fetchProfile(initialSession.user);
      }
      setIsLoading(false);
    });

    // 2. Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // 3. Deep link handler (for mobile redirect & OAuth callback)
    const handleDeepLink = async (event: { url: string }) => {
      try {
        const url = event.url;
        if (!url) return;

        // Parse hash or query parameters
        let tokenPart = '';
        if (url.includes('#')) {
          tokenPart = url.split('#')[1];
        } else if (url.includes('?')) {
          tokenPart = url.split('?')[1];
        }

        if (tokenPart) {
          const params = new URLSearchParams(tokenPart);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (data?.session) {
              setSession(data.session);
              setUser(data.session.user);
              await fetchProfile(data.session.user);
            }
          }
        }
      } catch (err) {
        console.warn('Deep link parsing error:', err);
      }
    };

    const linkSub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => {
      subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  // E-posta & Şifre ile Giriş
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (data.user) await fetchProfile(data.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  // Kayıt Ol
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    username: string
  ) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedUsername = username.trim().toLowerCase();

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: trimmedUsername,
          },
        },
      });

      if (error) {
        return { result: null, error: formatAuthError(error) };
      }

      // E-posta onayı gerekiyor mu kontrol et:
      // Eğer session null ise ve user dönmüşse e-posta doğrulaması beklenmektedir.
      const needsEmailVerification = !data.session && !!data.user;

      if (data.user) {
        // Profil tablosuna ön kayıt/hazırlık
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: trimmedUsername,
            full_name: fullName.trim(),
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch (profileErr) {
          console.warn('Profile sync note:', profileErr);
        }
      }

      return {
        result: {
          needsEmailVerification,
          user: data.user,
        },
        error: null,
      };
    } catch (err: any) {
      return { result: null, error: formatAuthError(err) };
    }
  };

  // Google OAuth ile Giriş
  const signInWithGoogle = async () => {
    try {
      const redirectUrl = Linking.createURL('auth');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      if (Platform.OS !== 'web' && data?.url) {
        const authResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (authResult.type === 'success' && authResult.url) {
          // URL hash parametrelerini ayrıştır
          const url = authResult.url;
          let tokenPart = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
          if (tokenPart) {
            const params = new URLSearchParams(tokenPart);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              const { data: sessionData, error: sessionErr } =
                await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

              if (sessionErr) return { error: formatAuthError(sessionErr) };

              if (sessionData.user) {
                await fetchProfile(sessionData.user);
              }
            }
          }
        }
      }

      return { error: null };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  // OTP Doğrulama (Email onay veya Şifre sıfırlama için)
  const verifyOtp = async (
    email: string,
    token: string,
    type: 'signup' | 'recovery' | 'email' = 'signup'
  ) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (data.user) await fetchProfile(data.user);
      }

      return { error: null };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  // Şifremi Unuttum E-postası Gönder
  const resetPasswordForEmail = async (email: string) => {
    try {
      const redirectUrl = Linking.createURL('reset-password');
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  // Yeni Şifre Belirle
  const updateUserPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  // E-posta Onay Kodunu Tekrar Gönder
  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  };

  // Çıkış Yap
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('SignOut error:', e);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  // Misafir / Demo Olarak Keşfet
  const signInAsGuest = async () => {
    setIsLoading(true);
    try {
      const email = 'zsenasahin.demo@kitaphane.app';
      const password = 'KitaphaneDemo2026!';

      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      let targetSession = data?.session;
      let targetUser = data?.user;

      if (!targetSession) {
        const signUpRes = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: 'Zeynep Sena', username: 'zsenasahin' },
          },
        });
        targetSession = signUpRes.data?.session;
        targetUser = signUpRes.data?.user;
      }

      if (targetSession && targetUser) {
        setSession(targetSession);
        setUser(targetUser);
        await fetchProfile(targetUser);
      }
    } catch (e) {
      console.warn('Guest sign in error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        verifyOtp,
        resetPasswordForEmail,
        updateUserPassword,
        resendVerificationEmail,
        signOut,
        signInAsGuest,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
