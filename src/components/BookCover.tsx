import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle, StyleProp } from 'react-native';
import { Book as BookIcon } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface BookCoverProps {
  url?: string | null;
  title: string;
  author?: string | null;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  standingShadow?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({
  url,
  title,
  author,
  width = 90,
  height = 135,
  style,
  standingShadow = false,
}) => {
  const hasImage = !!url && (url.startsWith('http://') || url.startsWith('https://'));

  return (
    <View
      style={[
        styles.container,
        { width, height },
        standingShadow && styles.standingShadow,
        style,
      ]}
    >
      {hasImage ? (
        <Image
          source={{ uri: url! }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        // Görsel yoksa zarif kabartma deri kapak tasarımı
        <View style={styles.placeholderCover}>
          <View style={styles.foilBorder}>
            <BookIcon size={width * 0.22} color={colors.goldLight} style={{ opacity: 0.85 }} />
            <Text
              numberOfLines={3}
              style={[styles.placeholderTitle, { fontSize: Math.max(9, width * 0.1) }]}
            >
              {title}
            </Text>
            {author ? (
              <Text
                numberOfLines={1}
                style={[styles.placeholderAuthor, { fontSize: Math.max(8, width * 0.08) }]}
              >
                {author}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Cilt / Sırt Gölgelendirme Efekti (Sol Kenar Derinliği) */}
      <View style={styles.spineHinge} />
      <View style={styles.spineHighlight} />

      {/* Sağ Kenar Sayfa Bloğu İpucu */}
      <View style={styles.pageEdgeLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.leatherDark,
    shadowColor: colors.leatherDark,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
    position: 'relative',
  },
  standingShadow: {
    shadowOffset: { width: 4, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primaryDark,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foilBorder: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 2,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTitle: {
    color: colors.goldLight,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    fontFamily: 'serif',
  },
  placeholderAuthor: {
    color: '#D4C3A3',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  spineHinge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  spineHighlight: {
    position: 'absolute',
    left: 6,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  pageEdgeLine: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(240, 230, 210, 0.4)',
  },
});
