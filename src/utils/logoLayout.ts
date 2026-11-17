export type LogoPosition =
  | "bottom_center"
  | "bottom_right"
  | "bottom_left"
  | "top_right";

export type LogoPaletteStyle = "official_vi" | "sunset_gold" | "ocean_teal";

export interface GtaViLogoConfig {
  enabled: boolean;
  text: string; // Max 7 characters
  paletteStyle: LogoPaletteStyle;
  position: LogoPosition;
  scale: number; // 0.5 to 1.35
  showTopWordmark: boolean;
  topWordmarkScale: number; // 0.6 to 1.45
  topWordmarkOffsetX: number; // -80 to 80 px
  topWordmarkOffsetY: number; // -80 to 80 px
  topWordmarkLineGap: number; // 0.68 to 1.05
}

export const MAX_LOGO_CHARS = 7;

export const DEFAULT_LOGO_CONFIG: GtaViLogoConfig = {
  enabled: true,
  text: "VI",
  paletteStyle: "official_vi",
  position: "bottom_center",
  scale: 1,
  showTopWordmark: true,
  topWordmarkScale: 1,
  topWordmarkOffsetX: 0,
  topWordmarkOffsetY: 0,
  topWordmarkLineGap: 0.78,
};

export const LOGO_PALETTE_OPTIONS: readonly {
  id: LogoPaletteStyle;
  label: string;
  stops: readonly [string, string, string, string];
  rimHex: string;
  previewGradient: string;
}[] = [
  {
    id: "official_vi",
    label: "Oficial VI (Azul → Magenta → Pôr do Sol)",
    stops: ["#4E6CF0", "#9E4CE0", "#F03FA8", "#F9C56E"],
    rimHex: "#F7B538",
    previewGradient:
      "linear-gradient(180deg, #4E6CF0 0%, #9E4CE0 35%, #F03FA8 68%, #F9C56E 100%)",
  },
  {
    id: "sunset_gold",
    label: "Golden Sunset (Ouro → Coral → Ameixa)",
    stops: ["#FCD183", "#FA8D5B", "#E85A8B", "#8B1E4F"],
    rimHex: "#FCE38A",
    previewGradient:
      "linear-gradient(180deg, #FCD183 0%, #FA8D5B 36%, #E85A8B 72%, #8B1E4F 100%)",
  },
  {
    id: "ocean_teal",
    label: "Ocean Teal (Turquesa → Violeta → Coral)",
    stops: ["#4FD1C5", "#4E6CF0", "#A8558F", "#F9A66C"],
    rimHex: "#9BF2EA",
    previewGradient:
      "linear-gradient(180deg, #4FD1C5 0%, #4E6CF0 36%, #A8558F 70%, #F9A66C 100%)",
  },
];

export function sanitizeLogoText(raw: string): string {
  return raw.replace(/[\r\n\t]+/g, " ").slice(0, MAX_LOGO_CHARS);
}

export function clampRange(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.max(min, Math.min(max, val));
}

export function computeLogoAnchor(
  width: number,
  height: number,
  position: LogoPosition,
  scale: number
): {
  x: number;
  y: number;
  align: CanvasTextAlign;
  fontSize: number;
} {
  const safeScale = clampRange(scale, 0.5, 1.35);
  // Official GTA VI cover ratio matches ~36% of portrait width for giant "VI"
  const baseFontSize = Math.round(width * 0.36 * safeScale);

  if (position === "bottom_right") {
    return {
      x: Math.round(width * 0.93),
      y: Math.round(height * 0.91),
      align: "right",
      fontSize: Math.round(baseFontSize * 0.54),
    };
  }
  if (position === "top_right") {
    return {
      x: Math.round(width * 0.93),
      y: Math.round(height * 0.2),
      align: "right",
      fontSize: Math.round(baseFontSize * 0.54),
    };
  }
  if (position === "bottom_left") {
    return {
      x: Math.round(width * 0.07),
      y: Math.round(height * 0.91),
      align: "left",
      fontSize: Math.round(baseFontSize * 0.6),
    };
  }
  // bottom_center (classic GTA VI cover lockup)
  return {
    x: Math.round(width * 0.5),
    y: Math.round(height * 0.9),
    align: "center",
    fontSize: baseFontSize,
  };
}

/**
 * Scales font size cleanly when user enters 3-7 characters so wider custom
 * phrases stay inside the 3:4 safe sublimation margin while "VI" keeps full cover scale.
 */
export function computeAdaptiveFontSize(
  baseFontSize: number,
  charCount: number
): number {
  const count = Math.max(1, Math.min(MAX_LOGO_CHARS, charCount));
  if (count <= 2) return baseFontSize;
  if (count === 3) return Math.round(baseFontSize * 0.72);
  if (count === 4) return Math.round(baseFontSize * 0.56);
  if (count === 5) return Math.round(baseFontSize * 0.45);
  if (count === 6) return Math.round(baseFontSize * 0.38);
  return Math.round(baseFontSize * 0.33);
}
