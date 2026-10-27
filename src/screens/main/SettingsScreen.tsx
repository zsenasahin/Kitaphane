import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, LogOut, UserPen } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { PressableScale, ScreenHeader } from '../../components/ui';
import { fonts, radius, Theme, THEME_ORDER, THEMES } from '../../theme/themes';

export const SettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { theme, themeName, setThemeName } = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { signOut, profile } = useAuth();
  const { push } = useApp();

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Ayarlar" onBack={onBack} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <Text style={s.label}>Tema</Text>
        <View style={s.themes}>
          {THEME_ORDER.map((name) => {
            const t = THEMES[name];
            const active = name === themeName;
            return (
              <PressableScale
                key={name}
                onPress={() => setThemeName(name)}
                style={[s.themeCard, { backgroundColor: t.bg, borderColor: active ? theme.primary : t.border }]}
              >
                {/* minyatür kitaplık önizlemesi */}
                <View style={[s.preview, { backgroundColor: t.woodBack }]}>
                  <View style={s.previewBooks}>
                    {t.spines.slice(0, 6).map((c, i) => (
                      <View key={i} style={{ width: 7 + (i % 3) * 2, height: 26 + (i % 2) * 6, backgroundColor: c, borderRadius: 1.5 }} />
                    ))}
                  </View>
                  <View style={{ height: 4, backgroundColor: t.woodShelf }} />
                </View>
                <View style={s.themeFooter}>
                  <View style={[s.swatch, { backgroundColor: t.primary }]} />
                  <Text style={[s.themeName, { color: t.text }]}>{t.label}</Text>
                  {active && (
                    <View style={[s.check, { backgroundColor: theme.primary }]}>
                      <Check size={11} color={theme.onPrimary} />
                    </View>
                  )}
                </View>
              </PressableScale>
            );
          })}
        </View>

        <Text style={[s.label, { marginTop: 28 }]}>Hesap</Text>
        <View style={s.group}>
          <PressableScale style={s.item} onPress={() => push({ name: 'editProfile' })} scaleTo={0.98}>
            <UserPen size={19} color={theme.text} />
            <View style={{ flex: 1 }}>
              <Text style={s.itemText}>Profili düzenle</Text>
              <Text style={s.itemSub}>Ad, kullanıcı adı, biyografi ve okuma hedefi</Text>
            </View>
          </PressableScale>
          <View style={s.sep} />
          <PressableScale style={s.item} onPress={signOut} scaleTo={0.98}>
            <LogOut size={19} color={theme.danger} />
            <View style={{ flex: 1 }}>
              <Text style={[s.itemText, { color: theme.danger }]}>Çıkış yap</Text>
              <Text style={s.itemSub}>@{profile?.username}</Text>
            </View>
          </PressableScale>
        </View>

        <Text style={s.footer}>Kitaphane · sayfalar arasında buluşalım</Text>
      </ScrollView>
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    label: { fontSize: 13, fontWeight: '800', color: t.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },
    themes: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    themeCard: { width: '47%', flexGrow: 1, borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
    preview: { height: 56, justifyContent: 'flex-end', paddingHorizontal: 10 },
    previewBooks: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
    themeFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
    swatch: { width: 16, height: 16, borderRadius: 8 },
    themeName: { flex: 1, fontFamily: fonts.serif, fontSize: 16, fontWeight: '700' },
    check: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    group: { backgroundColor: t.card, borderRadius: radius.lg, borderWidth: 1, borderColor: t.border },
    item: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
    itemText: { fontSize: 15.5, fontWeight: '700', color: t.text },
    itemSub: { fontSize: 12.5, color: t.textMuted, marginTop: 2 },
    sep: { height: 1, backgroundColor: t.border, marginLeft: 49 },
    footer: { textAlign: 'center', color: t.textMuted, fontSize: 12, marginTop: 30, fontStyle: 'italic' },
  });
