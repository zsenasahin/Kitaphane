import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  BookOpen,
  Sparkles,
  Trophy,
  Compass,
  Bookmark,
  Flame,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export const HomeScreen: React.FC = () => {
  const { profile, user } = useAuth();

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    profile?.username ||
    user?.email?.split('@')[0] ||
    'Kitapsever';

  const yearlyGoal = profile?.reading_goal_yearly || 12;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Karşılama Başlığı */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>İyi günler 👋</Text>
          <Text style={styles.nameText}>{displayName}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Flame size={16} color={colors.primary} />
          <Text style={styles.streakText}>3 Gün</Text>
        </View>
      </View>

      {/* Günün Alıntısı Kartı */}
      <View style={styles.quoteCard}>
        <View style={styles.quoteHeader}>
          <Sparkles size={18} color={colors.primary} />
          <Text style={styles.quoteTag}>GÜNÜN ALINTISI</Text>
        </View>
        <Text style={styles.quoteBody}>
          "Kitaplar, uygar dünyanın tek ve en büyük hazinesidir."
        </Text>
        <Text style={styles.quoteAuthor}>— Stefan Zweig</Text>
      </View>

      {/* Yıllık Hedef İlerlemesi */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIconCircle}>
            <Trophy size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.goalTitle}>2026 Okuma Hedefi</Text>
            <Text style={styles.goalSubtitle}>
              {yearlyGoal} kitap hedefinden 0 okundu
            </Text>
          </View>
          <Text style={styles.goalPercent}>%0</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '4%' }]} />
        </View>
      </View>

      {/* Şu An Okuduklarım Başlığı */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Şu An Okuduklarım</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Tümü</Text>
        </TouchableOpacity>
      </View>

      {/* Boş Durum veya Kitap Kartı */}
      <View style={styles.emptyBookCard}>
        <View style={styles.emptyIconCircle}>
          <Bookmark size={24} color={colors.accentLight} />
        </View>
        <Text style={styles.emptyTitle}>Henüz aktif kitabınız yok</Text>
        <Text style={styles.emptySubtitle}>
          Kütüphanenize yeni bir kitap ekleyerek okuma serüveninizi başlatın.
        </Text>
        <TouchableOpacity style={styles.addBookBtn}>
          <BookOpen size={16} color={colors.textInverse} style={{ marginRight: 6 }} />
          <Text style={styles.addBookBtnText}>Kitap Keşfet & Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* İlgi Alanları / Türler */}
      {profile?.favorite_genres && profile.favorite_genres.length > 0 && (
        <View style={styles.genresSection}>
          <Text style={styles.sectionTitle}>İlgi Duyduğunuz Türler</Text>
          <View style={styles.genreTags}>
            {profile.favorite_genres.map((genre, idx) => (
              <View key={idx} style={styles.genreTag}>
                <Text style={styles.genreTagText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  greetingText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quoteTag: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 6,
  },
  quoteBody: {
    color: colors.text,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 8,
  },
  quoteAuthor: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'right',
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  goalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  goalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  goalPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.accentLight,
    fontWeight: '600',
  },
  emptyBookCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  addBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBookBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
  genresSection: {
    marginBottom: 20,
  },
  genreTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  genreTag: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genreTagText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
