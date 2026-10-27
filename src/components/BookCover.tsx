import React, { useEffect, useState } from 'react';
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { fonts, hashString, shade } from '../theme/themes';
import { hasRealCover } from '../services/booksService';
import { coverService } from '../services/coverService';

interface BookCoverProps {
  url?: string | null;
  title: string;
  isbn?: string | null;
  author?: string | null;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  /** Gölgeyi belirginleştirir (detay sayfasındaki büyük kapak için). */
  standingShadow?: boolean;
}

/** Open Library eksik kapaklar için boş görsel döndürür; default=false ile 404 alıp tasarım kapağa düşeriz. */
const withNoDefault = (url: string) =>
  url.includes('covers.openlibrary.org') && !url.includes('default=') ? `${url}?default=false` : url;

export const BookCover: React.FC<BookCoverProps> = ({
  url,
  title,
  isbn,
  author,
  width = 90,
  height,
  style,
  standingShadow = false,
}) => {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);
  const ownCover = hasRealCover(url) && !failed;
  // Kayıtlı kapak yoksa (veya yüklenemediyse) gerçek kapağı dış katalogdan bul
  const [found, setFound] = useState<string | null>(() =>
    ownCover ? null : coverService.peek(title, author) || null
  );
  useEffect(() => {
    if (ownCover) return;
    let alive = true;
    coverService.resolve(title, author, isbn).then((u) => alive && setFound(u));
    return () => {
      alive = false;
    };
  }, [ownCover, title, author]);
  const [foundFailed, setFoundFailed] = useState(false);

  const h = height ?? Math.round(width * 1.5);
  const imageUrl = ownCover ? url! : !foundFailed ? found : null;
  const showImage = !!imageUrl;
  const seed = hashString(title + (author || ''));
  const bg = theme.spines[seed % theme.spines.length];
  const ink = shade(bg, -0.62);
  const r = Math.max(3, width * 0.05);

  return (
    <View
      style={[
        {
          width,
          height: h,
          borderRadius: r,
          backgroundColor: bg,
          shadowColor: '#2A1A10',
          shadowOffset: { width: 2, height: standingShadow ? 10 : 4 },
          shadowOpacity: standingShadow ? 0.3 : 0.16,
          shadowRadius: standingShadow ? 16 : 6,
          elevation: standingShadow ? 10 : 4,
        },
        style,
      ]}
    >
      <View style={[StyleSheet.absoluteFill, { borderRadius: r, overflow: 'hidden' }]}>
        {/* Tasarım kapak her zaman altta; gerçek kapak yüklenince üstüne oturur */}
        <View style={[styles.generated, { padding: width * 0.09 }]}>
          <View
            style={[
              styles.frame,
              { borderColor: ink + '55', borderRadius: Math.max(2, width * 0.03), padding: width * 0.06 },
            ]}
          >
            <View style={[styles.ornament, { backgroundColor: ink + '66', width: width * 0.22 }]} />
            <Text
              numberOfLines={4}
              adjustsFontSizeToFit
              style={{
                fontFamily: fonts.serif,
                fontWeight: '700',
                color: ink,
                fontSize: Math.max(8, width * 0.12),
                lineHeight: Math.max(10, width * 0.15),
                textAlign: 'center',
              }}
            >
              {title}
            </Text>
            <View style={[styles.ornament, { backgroundColor: ink + '66', width: width * 0.12 }]} />
            {author && width > 50 ? (
              <Text
                numberOfLines={2}
                style={{
                  color: ink + 'CC',
                  fontSize: Math.max(7, width * 0.075),
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                {author}
              </Text>
            ) : null}
          </View>
        </View>
        {showImage && (
          <Image
            source={{ uri: withNoDefault(imageUrl!) }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => (ownCover ? setFailed(true) : setFoundFailed(true))}
          />
        )}
        {/* Cilt kıvrımı ve ışık yansıması */}
        <View style={[styles.hinge, { width: Math.max(3, width * 0.06) }]} />
        <View style={[styles.hingeLight, { left: Math.max(3, width * 0.06) }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  generated: { flex: 1 },
  frame: {
    flex: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  ornament: { height: 1.5, borderRadius: 1 },
  hinge: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.14)' },
  hingeLight: { position: 'absolute', top: 0, bottom: 0, width: 1.5, backgroundColor: 'rgba(255,255,255,0.28)' },
});
