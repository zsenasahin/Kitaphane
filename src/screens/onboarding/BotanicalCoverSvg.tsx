import React from 'react';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Pattern,
} from 'react-native-svg';
import { onboardingColors } from './onboardingTheme';

interface BotanicalCoverSvgProps {
  width: number;
  height: number;
}

export const BotanicalCoverSvg: React.FC<BotanicalCoverSvgProps> = ({
  width,
  height,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 440">
      <Defs>
        {/* Deri Cilt Gradyanı */}
        <LinearGradient id="leatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4A2F1F" />
          <Stop offset="30%" stopColor="#3E2416" />
          <Stop offset="70%" stopColor="#321C11" />
          <Stop offset="100%" stopColor="#24130A" />
        </LinearGradient>

        {/* Altın Varak Gradyanı */}
        <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F5E4B2" />
          <Stop offset="35%" stopColor="#D4AF37" />
          <Stop offset="70%" stopColor="#AA8520" />
          <Stop offset="100%" stopColor="#E6CF88" />
        </LinearGradient>

        {/* Koyu Varak Kabartma Gradyanı */}
        <LinearGradient id="goldDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E1C67E" />
          <Stop offset="100%" stopColor="#967418" />
        </LinearGradient>

        {/* Cilt Kenarı Işık Efekti */}
        <LinearGradient id="edgeGleam" x1="0%" y1="0%" x2="10%" y2="0%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </LinearGradient>
      </Defs>

      {/* Arka Kapak Cilt Tabanı */}
      <Rect
        x="0"
        y="0"
        width="320"
        height="440"
        rx="8"
        fill="url(#leatherGrad)"
      />

      {/* Cilt Yüzey Işığı */}
      <Rect
        x="0"
        y="0"
        width="320"
        height="440"
        rx="8"
        fill="url(#edgeGleam)"
      />

      {/* Dış Altın Varak Çerçeve */}
      <Rect
        x="18"
        y="18"
        width="284"
        height="404"
        rx="4"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="2.5"
      />

      {/* İnce İç Çerçeve */}
      <Rect
        x="24"
        y="24"
        width="272"
        height="392"
        rx="2"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="0.8"
        strokeDasharray="4 2"
      />

      {/* Köşe Süslemeleri (Köşe Filigranları) */}
      {/* Sol Üst */}
      <G transform="translate(26, 26)">
        <Path
          d="M0,0 L24,0 C14,4 4,14 0,24 Z"
          fill="url(#goldGrad)"
          opacity="0.85"
        />
        <Circle cx="8" cy="8" r="2.5" fill="url(#goldGrad)" />
      </G>

      {/* Sağ Üst */}
      <G transform="translate(294, 26)">
        <Path
          d="M0,0 L-24,0 C-14,4 -4,14 0,24 Z"
          fill="url(#goldGrad)"
          opacity="0.85"
        />
        <Circle cx="-8" cy="8" r="2.5" fill="url(#goldGrad)" />
      </G>

      {/* Sol Alt */}
      <G transform="translate(26, 414)">
        <Path
          d="M0,0 L24,0 C14,-4 4,-14 0,-24 Z"
          fill="url(#goldGrad)"
          opacity="0.85"
        />
        <Circle cx="8" cy="-8" r="2.5" fill="url(#goldGrad)" />
      </G>

      {/* Sağ Alt */}
      <G transform="translate(294, 414)">
        <Path
          d="M0,0 L-24,0 C-14,-4 -4,-14 0,-24 Z"
          fill="url(#goldGrad)"
          opacity="0.85"
        />
        <Circle cx="-8" cy="-8" r="2.5" fill="url(#goldGrad)" />
      </G>

      {/* Üst Zarif Tepe Deseni / Taç */}
      <G transform="translate(160, 68)">
        <Path
          d="M-50,0 C-30,-12 -15,-6 0,-18 C15,-6 30,-12 50,0 C30,-4 15,-10 0,-7 C-15,-10 -30,-4 -50,0 Z"
          fill="url(#goldGrad)"
        />
        <Circle cx="0" cy="-22" r="3" fill="url(#goldGrad)" />
        <Circle cx="-20" cy="-14" r="1.8" fill="url(#goldGrad)" />
        <Circle cx="20" cy="-14" r="1.8" fill="url(#goldGrad)" />
      </G>

      {/* Başlık Bölümü: K İ T A P H A N E */}
      <SvgText
        x="160"
        y="114"
        textAnchor="middle"
        fill="url(#goldGrad)"
        fontSize="21"
        fontWeight="bold"
        letterSpacing="8"
        fontFamily="serif"
      >
        KİTAPHANE
      </SvgText>

      {/* Alt Başlık / Yaldız Çizgi */}
      <G transform="translate(160, 126)">
        <Path
          d="M-60,0 L60,0"
          stroke="url(#goldGrad)"
          strokeWidth="1"
        />
        <Circle cx="0" cy="0" r="3" fill="url(#goldGrad)" />
        <Circle cx="-40" cy="0" r="1.5" fill="url(#goldGrad)" />
        <Circle cx="40" cy="0" r="1.5" fill="url(#goldGrad)" />
      </G>

      <SvgText
        x="160"
        y="142"
        textAnchor="middle"
        fill="url(#goldDarkGrad)"
        fontSize="9"
        letterSpacing="4"
        fontFamily="serif"
      >
        BIBLIOTHECA NOBILIS
      </SvgText>

      {/* MERKEZİ BOTANİK İLLÜSTRASYON (Zarif Hayat Ağacı & Defne Dalları) */}
      <G transform="translate(160, 240)">
        {/* Arka Hafif Çember / Halo */}
        <Circle
          cx="0"
          cy="0"
          r="68"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="1.2"
          opacity="0.6"
        />
        <Circle
          cx="0"
          cy="0"
          r="62"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="0.6"
          strokeDasharray="2 3"
          opacity="0.5"
        />

        {/* Ana Botanik Gövde ve Dallar */}
        {/* Gövde */}
        <Path
          d="M0,50 Q-2,10 0,-30 Q2,10 0,50 Z"
          fill="url(#goldGrad)"
        />

        {/* Sol Dal 1 */}
        <Path
          d="M0,20 Q-22,10 -35,-8 Q-24,-4 0,8 Z"
          fill="url(#goldGrad)"
        />
        {/* Sol Yapraklar */}
        <Path
          d="M-35,-8 C-45,-15 -50,-8 -42,2 C-38,-2 -35,-6 -35,-8 Z"
          fill="url(#goldGrad)"
        />
        <Path
          d="M-22,4 C-32,0 -34,10 -25,12 C-22,8 -21,5 -22,4 Z"
          fill="url(#goldGrad)"
        />

        {/* Sağ Dal 1 */}
        <Path
          d="M0,20 Q22,10 35,-8 Q24,-4 0,8 Z"
          fill="url(#goldGrad)"
        />
        {/* Sağ Yapraklar */}
        <Path
          d="M35,-8 C45,-15 50,-8 42,2 C38,-2 35,-6 35,-8 Z"
          fill="url(#goldGrad)"
        />
        <Path
          d="M22,4 C32,0 34,10 25,12 C22,8 21,5 22,4 Z"
          fill="url(#goldGrad)"
        />

        {/* Sol Dal 2 (Üst) */}
        <Path
          d="M0,-5 Q-20,-20 -28,-42 Q-16,-28 0,-15 Z"
          fill="url(#goldGrad)"
        />
        <Path
          d="M-28,-42 C-38,-50 -40,-40 -32,-32 C-28,-36 -28,-40 -28,-42 Z"
          fill="url(#goldGrad)"
        />
        <Path
          d="M-15,-25 C-26,-28 -28,-18 -18,-16 C-16,-20 -15,-23 -15,-25 Z"
          fill="url(#goldGrad)"
        />

        {/* Sağ Dal 2 (Üst) */}
        <Path
          d="M0,-5 Q20,-20 28,-42 Q16,-28 0,-15 Z"
          fill="url(#goldGrad)"
        />
        <Path
          d="M28,-42 C38,-50 40,-40 32,-32 C28,-36 28,-40 28,-42 Z"
          fill="url(#goldGrad)"
        />
        <Path
          d="M15,-25 C26,-28 28,-18 18,-16 C16,-20 15,-23 15,-25 Z"
          fill="url(#goldGrad)"
        />

        {/* Tepe Tomurcuk / Yaprak */}
        <Path
          d="M0,-30 C-8,-45 0,-56 0,-56 C0,-56 8,-45 0,-30 Z"
          fill="url(#goldGrad)"
        />
        <Circle cx="0" cy="-59" r="2.5" fill="url(#goldGrad)" />

        {/* Botanik Çiçek ve Meyve Detayları */}
        <Circle cx="-18" cy="18" r="2.2" fill="url(#goldGrad)" />
        <Circle cx="18" cy="18" r="2.2" fill="url(#goldGrad)" />
        <Circle cx="-28" cy="-18" r="2.2" fill="url(#goldGrad)" />
        <Circle cx="28" cy="-18" r="2.2" fill="url(#goldGrad)" />

        {/* Kök Kaidesi */}
        <Path
          d="M-28,52 Q0,46 28,52 Q0,50 -28,52 Z"
          fill="url(#goldGrad)"
        />
      </G>

      {/* Alt Süsleme / Edebi Motto */}
      <SvgText
        x="160"
        y="350"
        textAnchor="middle"
        fill="url(#goldDarkGrad)"
        fontSize="8.5"
        letterSpacing="3"
        fontFamily="serif"
      >
        — EDİTİO PRİNCEPS —
      </SvgText>

      <G transform="translate(160, 368)">
        <Path
          d="M-40,0 Q-20,-8 0,0 Q20,-8 40,0 Q20,-4 0,-1 Q-20,-4 -40,0 Z"
          fill="url(#goldGrad)"
          opacity="0.8"
        />
        <Circle cx="0" cy="0" r="2.5" fill="url(#goldGrad)" />
      </G>

      {/* Cilt Dikiş / Katlanma Yiv Çizgisi (Spine Hinge Crease) */}
      <Rect
        x="28"
        y="6"
        width="3"
        height="428"
        fill="rgba(0,0,0,0.35)"
      />
      <Rect
        x="31"
        y="6"
        width="1.5"
        height="428"
        fill="rgba(255,255,255,0.12)"
      />
    </Svg>
  );
};
