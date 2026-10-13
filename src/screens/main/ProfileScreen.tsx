import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Target,
  Clock,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';

export const ProfileScreen: React.FC = () => {
  const { profile, user, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    profile?.username ||
    'Kitapsever';

  const username =
    profile?.username ||
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'okur';

  const email = user?.email || 'Bilinmiyor';

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await signOut();
            setLoggingOut(false);
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profilim</Text>
      </View>

      {/* Profil Kartı */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
        </View>

        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.username}>@{username}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.verifiedBadge}>
            <ShieldCheck size={14} color={colors.success} />
            <Text style={styles.verifiedText}>Supabase Doğrulandı</Text>
          </View>
        </View>

        <View style={styles.emailContainer}>
          <Mail size={15} color={colors.textSecondary} />
          <Text style={styles.emailText}>{email}</Text>
        </View>
      </View>

      {/* Okuma Alışkanlıkları ve Hedefler */}
      <Text style={styles.sectionTitle}>Okuma İstatistikleri</Text>
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statIconCircle}>
            <Target size={18} color={colors.primary} />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Yıllık Hedef</Text>
            <Text style={styles.statValue}>
              {profile?.reading_goal_yearly || 12} Kitap
            </Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statRow}>
          <View style={styles.statIconCircle}>
            <Clock size={18} color={colors.accentLight} />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Okuma Sıklığı</Text>
            <Text style={styles.statValue}>
              {profile?.reading_frequency || 'Haftada birkaç gün'}
            </Text>
          </View>
        </View>
      </View>

      {/* Sevilen Türler */}
      {profile?.favorite_genres && profile.favorite_genres.length > 0 && (
        <View style={styles.genresSection}>
          <Text style={styles.sectionTitle}>Favori Türler</Text>
          <View style={styles.genreTags}>
            {profile.favorite_genres.map((genre, idx) => (
              <View key={idx} style={styles.genreTag}>
                <BookOpen size={13} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.genreTagText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={styles.logoutBtn}
        disabled={loggingOut}
      >
        <LogOut size={20} color={colors.error} style={{ marginRight: 10 }} />
        <Text style={styles.logoutText}>Oturumu Kapat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: colors.accentLight,
    fontWeight: '600',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emailText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    marginLeft: 14,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  genresSection: {
    marginBottom: 28,
  },
  genreTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genreTagText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
});
