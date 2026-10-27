import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { Profile } from '../../lib/types';
import { socialService } from '../../services/socialService';
import { Avatar, EmptyState, PressableScale, ScreenHeader } from '../../components/ui';
import { radius, Theme } from '../../theme/themes';

export const FollowsScreen: React.FC<{ userId: string; mode: 'followers' | 'following'; onBack: () => void }> = ({
  userId,
  mode,
  onBack,
}) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { push } = useApp();
  const [people, setPeople] = useState<Profile[] | null>(null);

  useEffect(() => {
    socialService.getFollowList(userId, mode).then(setPeople);
  }, [userId, mode]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScreenHeader title={mode === 'followers' ? 'Takipçiler' : 'Takip edilenler'} onBack={onBack} />
      {!people ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={people}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          ListEmptyComponent={
            <EmptyState
              icon={<Users size={28} color={theme.primary} />}
              title={mode === 'followers' ? 'Henüz takipçi yok' : 'Henüz kimse takip edilmiyor'}
            />
          }
          renderItem={({ item }) => (
            <PressableScale onPress={() => push({ name: 'profile', userId: item.id })} scaleTo={0.98} style={s.row}>
              <Avatar name={item.full_name || item.username} url={item.avatar_url} size={50} />
              <View style={{ flex: 1 }}>
                <Text style={s.name} numberOfLines={1}>
                  {item.full_name || item.username}
                </Text>
                <Text style={s.user} numberOfLines={1}>
                  @{item.username}
                </Text>
              </View>
            </PressableScale>
          )}
        />
      )}
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 12,
      marginBottom: 10,
      borderRadius: radius.lg,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    name: { fontSize: 15.5, fontWeight: '700', color: t.text },
    user: { fontSize: 13, color: t.textMuted, marginTop: 2 },
  });
