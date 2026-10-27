import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Minus, Plus } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { socialService } from '../../services/socialService';
import { Avatar, PressableScale, ScreenHeader } from '../../components/ui';
import { fonts, radius, Theme } from '../../theme/themes';

const GOAL_PRESETS = [12, 24, 50, 100];

export const EditProfileScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user, profile, refreshProfile } = useAuth();
  const { bump } = useApp();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [goal, setGoal] = useState(profile?.reading_goal_yearly || 12);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  const changePhoto = async () => {
    if (!user) return;
    setUploading(true);
    const { url, error } = await socialService.pickAndUploadAvatar(user.id);
    setUploading(false);
    if (error) return showToast(error, 'error');
    if (!url) return;
    setAvatarUrl(url);
    await refreshProfile();
    bump('profile', 'posts');
    showToast('Profil fotoğrafın güncellendi');
  };

  const removePhoto = async () => {
    if (!user) return;
    const { error } = await socialService.removeAvatar(user.id);
    if (error) return showToast(error, 'error');
    setAvatarUrl(null);
    await refreshProfile();
    bump('profile', 'posts');
  };

  const save = async () => {
    if (!user) return;
    if (!fullName.trim()) return showToast('Adını boş bırakamazsın.', 'error');
    setSaving(true);
    const { error } = await socialService.updateProfile(user.id, {
      full_name: fullName.trim(),
      username,
      bio: bio.trim() || null,
      reading_goal_yearly: goal,
    });
    if (error) {
      setSaving(false);
      return showToast(error, 'error');
    }
    await refreshProfile();
    bump('profile', 'posts');
    setSaving(false);
    showToast('Profilin güncellendi');
    onBack();
  };

  return (
    <KeyboardAvoidingView style={[s.container, { paddingTop: insets.top }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader
        title="Profili düzenle"
        onBack={onBack}
        right={
          <PressableScale onPress={save} disabled={saving} style={s.saveBtn}>
            {saving ? <ActivityIndicator size="small" color={theme.onPrimary} /> : <Text style={s.saveText}>Kaydet</Text>}
          </PressableScale>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <PressableScale onPress={changePhoto} disabled={uploading} accessibilityLabel="Profil fotoğrafını değiştir">
            <Avatar name={fullName || username} url={avatarUrl} size={104} />
            <View style={s.cameraBadge}>
              {uploading ? <ActivityIndicator size="small" color={theme.onPrimary} /> : <Camera size={16} color={theme.onPrimary} />}
            </View>
          </PressableScale>
          <View style={s.photoActions}>
            <Pressable onPress={changePhoto} hitSlop={8} disabled={uploading}>
              <Text style={s.photoLink}>{avatarUrl ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}</Text>
            </Pressable>
            {avatarUrl && (
              <Pressable onPress={removePhoto} hitSlop={8}>
                <Text style={[s.photoLink, { color: theme.danger }]}>Kaldır</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Text style={s.label}>Ad Soyad</Text>
        <TextInput value={fullName} onChangeText={setFullName} style={s.input} placeholderTextColor={theme.textMuted} maxLength={50} />

        <Text style={s.label}>Kullanıcı adı</Text>
        <View style={[s.input, s.row]}>
          <Text style={{ color: theme.textMuted, fontSize: 16 }}>@</Text>
          <TextInput
            value={username}
            onChangeText={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
            style={[s.inputInner]}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={24}
          />
        </View>

        <Text style={s.label}>Biyografi</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={[s.input, { minHeight: 96, textAlignVertical: 'top', paddingTop: 14 }]}
          multiline
          maxLength={160}
          placeholder="Hangi kitaplar seni anlatır?"
          placeholderTextColor={theme.textMuted}
        />
        <Text style={s.counter}>{bio.length}/160</Text>

        <Text style={s.label}>{new Date().getFullYear()} okuma hedefi</Text>
        <View style={s.goalBox}>
          <PressableScale onPress={() => setGoal(Math.max(1, goal - 1))} style={s.stepBtn}>
            <Minus size={18} color={theme.text} />
          </PressableScale>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={s.goalNum}>{goal}</Text>
            <Text style={s.goalUnit}>kitap</Text>
          </View>
          <PressableScale onPress={() => setGoal(Math.min(999, goal + 1))} style={s.stepBtn}>
            <Plus size={18} color={theme.text} />
          </PressableScale>
        </View>
        <View style={s.presets}>
          {GOAL_PRESETS.map((g) => (
            <PressableScale key={g} onPress={() => setGoal(g)} style={[s.preset, goal === g && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
              <Text style={[s.presetText, goal === g && { color: theme.onPrimary }]}>{g}</Text>
            </PressableScale>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    saveBtn: { backgroundColor: t.primary, paddingHorizontal: 18, height: 38, borderRadius: radius.pill, justifyContent: 'center', minWidth: 80, alignItems: 'center' },
    saveText: { color: t.onPrimary, fontWeight: '800', fontSize: 14 },
    cameraBadge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: t.primary,
      borderWidth: 3,
      borderColor: t.bg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoActions: { flexDirection: 'row', gap: 20, marginTop: 12 },
    photoLink: { fontSize: 14, fontWeight: '700', color: t.primary },
    label: { fontSize: 13, fontWeight: '700', color: t.textSoft, marginBottom: 8, marginTop: 18 },
    input: {
      minHeight: 52,
      borderRadius: radius.md,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 16,
      fontSize: 16,
      color: t.text,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    inputInner: { flex: 1, fontSize: 16, color: t.text, height: 50 },
    counter: { alignSelf: 'flex-end', fontSize: 11.5, color: t.textMuted, marginTop: 4 },
    goalBox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: radius.lg,
      backgroundColor: t.primarySoft,
    },
    stepBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: t.card, alignItems: 'center', justifyContent: 'center' },
    goalNum: { fontFamily: fonts.serif, fontSize: 36, fontWeight: '700', color: t.text },
    goalUnit: { fontSize: 13, color: t.textSoft, marginTop: -2 },
    presets: { flexDirection: 'row', gap: 10, marginTop: 12 },
    preset: { flex: 1, height: 40, borderRadius: radius.pill, borderWidth: 1, borderColor: t.border, backgroundColor: t.card, alignItems: 'center', justifyContent: 'center' },
    presetText: { fontWeight: '700', color: t.textSoft },
  });
