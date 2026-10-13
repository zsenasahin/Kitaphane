import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { BookMarked, Plus, Library as LibraryIcon } from 'lucide-react-native';
import { colors } from '../../theme/colors';

type TabType = 'reading' | 'want_to_read' | 'completed';

export const LibraryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('reading');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kitaplığım</Text>
          <Text style={styles.subtitle}>Okuma listeleriniz ve raflarınız</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Plus size={20} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Segmented Filtre Butonları */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('reading')}
          style={[styles.tabBtn, activeTab === 'reading' && styles.tabBtnActive]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'reading' && styles.tabTextActive,
            ]}
          >
            Okuyorum (0)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('want_to_read')}
          style={[
            styles.tabBtn,
            activeTab === 'want_to_read' && styles.tabBtnActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'want_to_read' && styles.tabTextActive,
            ]}
          >
            Okunacak (0)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={[
            styles.tabBtn,
            activeTab === 'completed' && styles.tabBtnActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.tabTextActive,
            ]}
          >
            Bitti (0)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <LibraryIcon size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Bu rafta henüz kitap yok</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'reading'
              ? 'Şu anda okuduğunuz kitapları ekleyerek sayfa ilerlemenizi takip edin.'
              : activeTab === 'want_to_read'
              ? 'Daha sonra okumak istediğiniz kitapları listenize kaydedin.'
              : 'Bitirdiğiniz kitapları puanlayıp incelemeler yazın.'}
          </Text>
          <TouchableOpacity style={styles.actionBtn}>
            <Plus size={16} color={colors.textInverse} style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnText}>Kitap Ekle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: colors.surfaceHighlight,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
