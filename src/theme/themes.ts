import { Platform } from 'react-native';

export type ThemeName = 'latte' | 'sage' | 'rose' | 'night' | 'cream';

export interface Theme {
  name: ThemeName;
  label: string;
  dark: boolean;

  // Zemin & yüzeyler
  bg: string;
  bgSoft: string;
  card: string;
  cardAlt: string;
  border: string;
  overlay: string;

  // Tipografi
  text: string;
  textSoft: string;
  textMuted: string;
  onPrimary: string;

  // Vurgu renkleri
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  danger: string;
  success: string;

  // Paylaşım türlerine özel pastel zeminler
  quoteBg: string;
  reviewBg: string;
  updateBg: string;
  thoughtBg: string;

  // Kitaplık (ahşap) tonları
  woodBack: string;
  woodBackDeep: string;
  woodFrame: string;
  woodFrameLight: string;
  woodShelf: string;
  woodShadow: string;

  // Kitap sırtları için pastel palet
  spines: string[];
}

const SPINES_WARM = [
  '#F4C7B8', '#F7DDB5', '#BFD8C5', '#B9D3E3', '#D9C7E8', '#F2B8C6',
  '#E8D9A8', '#C9E2DA', '#F5CBA7', '#C7CEEA', '#E2B6A7', '#A8D5BA',
];

export const THEMES: Record<ThemeName, Theme> = {
  latte: {
    name: 'latte',
    label: 'Kahve',
    dark: false,
    bg: '#F7F1EA',
    bgSoft: '#EFE5D9',
    card: '#FFFCF8',
    cardAlt: '#F3EADF',
    border: '#E7DACB',
    overlay: 'rgba(43, 30, 22, 0.55)',
    text: '#3A2C25',
    textSoft: '#6E5B50',
    textMuted: '#A39184',
    onPrimary: '#FFFAF4',
    primary: '#9C7258',
    primarySoft: '#EBD9C8',
    accent: '#E7A98F',
    accentSoft: '#F8E1D6',
    danger: '#D5767A',
    success: '#7FAE8E',
    quoteBg: '#FBEBDD',
    reviewBg: '#F1E6F2',
    updateBg: '#E4EFE6',
    thoughtBg: '#FFFCF8',
    woodBack: '#6B4A33',
    woodBackDeep: '#3F2A1C',
    woodFrame: '#8A5F3F',
    woodFrameLight: '#A87A55',
    woodShelf: '#9A6C49',
    woodShadow: 'rgba(25, 14, 6, 0.55)',
    spines: SPINES_WARM,
  },
  sage: {
    name: 'sage',
    label: 'Adaçayı',
    dark: false,
    bg: '#F1F5EF',
    bgSoft: '#E3ECE0',
    card: '#FFFFFF',
    cardAlt: '#EAF1E7',
    border: '#D7E3D3',
    overlay: 'rgba(28, 40, 30, 0.5)',
    text: '#26352A',
    textSoft: '#55685A',
    textMuted: '#8EA093',
    onPrimary: '#F7FBF5',
    primary: '#6E9677',
    primarySoft: '#D5E6D6',
    accent: '#E6B98A',
    accentSoft: '#F6E7D3',
    danger: '#D27D7D',
    success: '#6E9677',
    quoteBg: '#E6F0E2',
    reviewBg: '#F6EEDD',
    updateBg: '#E2EDF2',
    thoughtBg: '#FFFFFF',
    woodBack: '#B89874',
    woodBackDeep: '#8C6E4E',
    woodFrame: '#C8A982',
    woodFrameLight: '#DCC3A0',
    woodShelf: '#D2B58F',
    woodShadow: 'rgba(60, 42, 20, 0.4)',
    spines: ['#BFD8C5', '#F7DDB5', '#B9D3E3', '#F4C7B8', '#D8E7B8', '#C9E2DA', '#E8D9A8', '#D9C7E8', '#A8D5BA', '#F5CBA7', '#C7CEEA', '#E2CFA8'],
  },
  rose: {
    name: 'rose',
    label: 'Gül',
    dark: false,
    bg: '#FCF2F3',
    bgSoft: '#F7E2E5',
    card: '#FFFFFF',
    cardAlt: '#FBEAEC',
    border: '#F1D6DA',
    overlay: 'rgba(60, 26, 34, 0.5)',
    text: '#45282F',
    textSoft: '#7A5960',
    textMuted: '#B4959B',
    onPrimary: '#FFF8F9',
    primary: '#CC7F8E',
    primarySoft: '#F6D6DC',
    accent: '#A9B9E6',
    accentSoft: '#E3E9FA',
    danger: '#D5676F',
    success: '#7DB394',
    quoteBg: '#FBE4E8',
    reviewBg: '#ECE8FA',
    updateBg: '#E5F2EC',
    thoughtBg: '#FFFFFF',
    woodBack: '#C99C8E',
    woodBackDeep: '#9E7064',
    woodFrame: '#DDB5A8',
    woodFrameLight: '#ECCFC5',
    woodShelf: '#E3BEB1',
    woodShadow: 'rgba(80, 36, 30, 0.35)',
    spines: ['#F2B8C6', '#F7DDB5', '#C7CEEA', '#F4C7B8', '#D9C7E8', '#BFD8C5', '#F9D5E5', '#B9D3E3', '#E8C1A0', '#C9E2DA', '#E7B3B3', '#E8D9A8'],
  },
  night: {
    name: 'night',
    label: 'Gece',
    dark: true,
    bg: '#16151B',
    bgSoft: '#1F1E26',
    card: '#24232C',
    cardAlt: '#2C2B35',
    border: '#35343F',
    overlay: 'rgba(0, 0, 0, 0.65)',
    text: '#F3EFF7',
    textSoft: '#BDB7C8',
    textMuted: '#7E788B',
    onPrimary: '#1B1A21',
    primary: '#C6B4EA',
    primarySoft: '#3A3450',
    accent: '#F2C6A8',
    accentSoft: '#4A3A33',
    danger: '#F09AA2',
    success: '#A6D8B8',
    quoteBg: '#2E2A3B',
    reviewBg: '#3A2E36',
    updateBg: '#26332E',
    thoughtBg: '#24232C',
    woodBack: '#2A1C14',
    woodBackDeep: '#140D09',
    woodFrame: '#4A3021',
    woodFrameLight: '#634330',
    woodShelf: '#573A28',
    woodShadow: 'rgba(0, 0, 0, 0.7)',
    spines: ['#C6B4EA', '#F2C6A8', '#A6D8B8', '#F0A8B8', '#A9C7E8', '#E8DCA8', '#D7B8E8', '#9FD3CC', '#F5CBA7', '#C7CEEA', '#E2B6A7', '#B8E0C2'],
  },
  cream: {
    name: 'cream',
    label: 'Beyaz',
    dark: false,
    bg: '#FFFFFF',
    bgSoft: '#F5F4F1',
    card: '#FFFFFF',
    cardAlt: '#F7F6F3',
    border: '#ECEAE5',
    overlay: 'rgba(25, 27, 36, 0.45)',
    text: '#22242C',
    textSoft: '#5C5F6B',
    textMuted: '#9A9CA6',
    onPrimary: '#FFFFFF',
    primary: '#7D8FC4',
    primarySoft: '#E1E6F6',
    accent: '#F0B6A0',
    accentSoft: '#FBE7DF',
    danger: '#E07A80',
    success: '#7FB89A',
    quoteBg: '#F1F3FB',
    reviewBg: '#FCF0EA',
    updateBg: '#EDF6F1',
    thoughtBg: '#FFFFFF',
    woodBack: '#D9C6AE',
    woodBackDeep: '#B9A184',
    woodFrame: '#E6D6C1',
    woodFrameLight: '#F1E6D7',
    woodShelf: '#EADBC6',
    woodShadow: 'rgba(70, 50, 30, 0.3)',
    spines: SPINES_WARM,
  },
};

export const THEME_ORDER: ThemeName[] = ['latte', 'sage', 'rose', 'night', 'cream'];

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' }) as string,
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }) as string,
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };

/** Kart gölgesi — açık temalarda yumuşak, koyu temada neredeyse yok. */
export const shadow = (t: Theme, level: 1 | 2 | 3 = 1) => ({
  shadowColor: t.dark ? '#000' : t.text,
  shadowOffset: { width: 0, height: level * 3 },
  shadowOpacity: t.dark ? 0.35 : 0.05 + level * 0.025,
  shadowRadius: level * 6,
  elevation: level * 2,
});

/** Bir metinden kararlı bir sayı üretir (kitap sırtı renk/ölçü seçimi için). */
export const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/** Hex rengi koyulaştırır/açar (amount: -1..1). */
export const shade = (hex: string, amount: number): string => {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const f = (c: number) =>
    Math.max(0, Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)));
  return `#${((1 << 24) | (f(r) << 16) | (f(g) << 8) | f(b)).toString(16).slice(1)}`;
};
