import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { useStyles, useTheme } from '../../context/ThemeContext';
import { Book } from '../../lib/types';
import { booksService } from '../../services/booksService';
import { BookCover } from '../../components/BookCover';
import { Avatar, PressableScale, ScreenHeader } from '../../components/ui';
import { fonts, radius, Theme } from '../../theme/themes';

export const AuthorScreen: React.FC<{ author: string; authorKey?: string | null; onBack: () => void }> = ({
  author,
  authorKey,
  onBack,
}) => {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { push } = useApp();
  const [data, setData] = useState<{ bio: string | null; birth: string | null; death: string | null; photoUrl: string | null; books: Book[] } | null>(null);
  const [bioOpen, setBioOpen] = useState(false);

  useEffect(() => {
    booksService.getAuthor(author, authorKey).then(setData);
  }, [author]);

  const col = (Math.min(width, 640) - 32 - 24) / 3;
  const life = data && (data.birth || data.death) ? `${data.birth || '?'} – ${data.death || ''}` : null;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <ScreenHeader onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        <View style={s.head}>
          <Avatar name={author} url={data?.photoUrl} size={110} ring />
          <Text style={s.name}>{author}</Text>
          {life && <Text style={s.life}>{life}</Text>}
          {data && <Text style={s.count}>{data.books.length} eser</Text>}
        </View>

        {!data ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 30 }} />
        ) : (
          <>
            {data.bio && (
              <View style={s.bioCard}>
                <Text style={s.bio} numberOfLines={bioOpen ? undefined : 5}>
                  {data.bio}
                </Text>
                {data.bio.length > 260 && (
                  <Pressable onPress={() => setBioOpen(!bioOpen)}>
                    <Text style={s.more}>{bioOpen ? 'daha az' : 'devamını oku'}</Text>
                  </Pressable>
                )}
              </View>
            )}
            <Text style={s.h2}>Eserleri</Text>
            <View style={s.grid}>
              {data.books.map((b) => (
                <PressableScale key={b.id} onPress={() => push({ name: 'book', book: b })} style={{ width: col }}>
                  <BookCover url={b.thumbnail_url} title={b.title} author={b.authors?.[0]} width={col} />
                  <Text style={s.bookTitle} numberOfLines={2}>
                    {b.title}
                  </Text>
                  {b.published_date ? <Text style={s.bookYear}>{b.published_date.slice(0, 4)}</Text> : null}
                </PressableScale>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.bg },
    head: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 10 },
    name: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', color: t.text, marginTop: 14, textAlign: 'center' },
    life: { fontSize: 14, color: t.textMuted, marginTop: 4 },
    count: { fontSize: 13, fontWeight: '700', color: t.primary, marginTop: 6 },
    bioCard: { marginHorizontal: 16, marginTop: 14, padding: 16, borderRadius: radius.lg, backgroundColor: t.card, borderWidth: 1, borderColor: t.border },
    bio: { fontSize: 14.5, lineHeight: 22, color: t.textSoft },
    more: { color: t.primary, fontWeight: '700', marginTop: 6 },
    h2: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: t.text, marginHorizontal: 20, marginTop: 24, marginBottom: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
    bookTitle: { fontSize: 12.5, fontWeight: '700', color: t.text, marginTop: 6 },
    bookYear: { fontSize: 11.5, color: t.textMuted, marginTop: 1 },
  });
