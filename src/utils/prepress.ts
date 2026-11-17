export type BlackFloorHex = "#1C102A" | "#221433" | "#141416";

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface PrepressOptions {
  blackFloorHex: BlackFloorHex;
  applyBlackCompensation: boolean;
  applyFeatheredVignette: boolean;
  vignetteIntensity: number; // 0 to 1
  highlightPureBlackRisk: boolean;
}

export interface PrepressAudit {
  totalPixels: number;
  crushedBlackPixelsOriginal: number;
  crushedBlackPercentOriginal: number;
  minHexOriginal: string;
  minHexCompensated: string;
  aspectRatioLabel: string;
  aspectCompliant: boolean;
  estimatedInkLoadPercent: number;
}

export const BLACK_FLOOR_OPTIONS: {
  hex: BlackFloorHex;
  label: string;
  note: string;
}[] = [
  {
    hex: "#1C102A",
    label: "#1C102A · Plum GTA VI (Oficial)",
    note: "Preto máximo violeta da paleta Vice City",
  },
  {
    hex: "#221433",
    label: "#221433 · Violeta Malha Fria",
    note: "Alívio extra de carga em poliéster leve",
  },
  {
    hex: "#141416",
    label: "#141416 · Poliéster Neutro",
    note: "Piso técnico padrão anti-borrão",
  },
];

export function hexToRgb(hex: string): RgbColor {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return { r: 20, g: 20, b: 22 };
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/**
 * Smoothly lifts deep shadow channels below the knee (48) up to `floor`,
 * preventing pure #000000 ink pooling in heat-press polyester sublimation
 * while leaving midtones and highlights untouched.
 */
export function liftShadowChannel(value: number, floor: number): number {
  const clamped = Math.max(0, Math.min(255, value));
  if (clamped >= 48 || floor <= 0) {
    return clamped;
  }
  const ratio = clamped / 48;
  return Math.round(floor + ratio * (48 - floor));
}

/**
 * Computes center-crop rectangle to enforce a strict 3:4 aspect ratio.
 */
export function calculateCropTo3x4(
  srcWidth: number,
  srcHeight: number
): { sx: number; sy: number; sw: number; sh: number } {
  if (srcWidth <= 0 || srcHeight <= 0) {
    return { sx: 0, sy: 0, sw: 0, sh: 0 };
  }
  const targetRatio = 3 / 4;
  const srcRatio = srcWidth / srcHeight;

  if (Math.abs(srcRatio - targetRatio) < 0.001) {
    return { sx: 0, sy: 0, sw: srcWidth, sh: srcHeight };
  }

  if (srcRatio > targetRatio) {
    // Wider than 3:4 -> crop horizontally
    const sw = Math.round(srcHeight * targetRatio);
    const sx = Math.round((srcWidth - sw) / 2);
    return { sx, sy: 0, sw, sh: srcHeight };
  }

  // Taller than 3:4 -> crop vertically (bias slightly toward upper-third for portraits)
  const sh = Math.round(srcWidth / targetRatio);
  const sy = Math.round((srcHeight - sh) * 0.35);
  return { sx: 0, sy, sw: srcWidth, sh };
}

export function applySublimationPrepress(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  options: PrepressOptions
): { output: Uint8ClampedArray; audit: PrepressAudit } {
  const output = new Uint8ClampedArray(rgba.length);
  const floorRgb = hexToRgb(options.blackFloorHex);
  const totalPixels = Math.max(1, width * height);

  let crushedBlackPixelsOriginal = 0;
  let minLumOriginal = 999;
  let minHexOriginal = "#FFFFFF";
  let minLumCompensated = 999;
  let minHexCompensated = "#FFFFFF";
  let inkLoadSum = 0;

  const cx = width / 2;
  const cy = height / 2;
  const maxRx = width * 0.5;
  const maxRy = height * 0.5;

  for (let i = 0; i < rgba.length; i += 4) {
    const pixelIndex = i / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    const origR = rgba[i];
    const origG = rgba[i + 1];
    const origB = rgba[i + 2];
    const origA = rgba[i + 3];

    const origLum = 0.2126 * origR + 0.7152 * origG + 0.0722 * origB;
    if (origLum < minLumOriginal) {
      minLumOriginal = origLum;
      minHexOriginal = rgbToHex(origR, origG, origB);
    }

    const isCrushedBlack = origR < 20 && origG < 20 && origB < 22;
    if (isCrushedBlack) {
      crushedBlackPixelsOriginal++;
    }

    let r = origR;
    let g = origG;
    let b = origB;

    if (options.applyFeatheredVignette && width > 0 && height > 0) {
      const dx = (x - cx) / maxRx;
      const dy = (y - cy) / maxRy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.72) {
        const edgeProgress = Math.min(1, (dist - 0.72) / 0.42);
        const fade = Math.pow(edgeProgress, 1.65) * options.vignetteIntensity;
        r = Math.round(r * (1 - fade) + floorRgb.r * fade);
        g = Math.round(g * (1 - fade) + floorRgb.g * fade);
        b = Math.round(b * (1 - fade) + floorRgb.b * fade);
      }
    }

    if (options.applyBlackCompensation) {
      r = liftShadowChannel(r, floorRgb.r);
      g = liftShadowChannel(g, floorRgb.g);
      b = liftShadowChannel(b, floorRgb.b);
    }

    const compLum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (compLum < minLumCompensated) {
      minLumCompensated = compLum;
      minHexCompensated = rgbToHex(r, g, b);
    }

    // Ink load proxy: darker pixels require higher sublimation dye density
    inkLoadSum += 1 - compLum / 255;

    if (options.highlightPureBlackRisk && isCrushedBlack) {
      // Diagnostic risk overlay in vivid amber-red (#E85D2A)
      output[i] = 232;
      output[i + 1] = 93;
      output[i + 2] = 42;
      output[i + 3] = origA;
    } else {
      output[i] = r;
      output[i + 1] = g;
      output[i + 2] = b;
      output[i + 3] = origA;
    }
  }

  const ratio = width > 0 && height > 0 ? width / height : 0;
  const aspectCompliant = Math.abs(ratio - 0.75) < 0.02;

  return {
    output,
    audit: {
      totalPixels,
      crushedBlackPixelsOriginal,
      crushedBlackPercentOriginal: Number(
        ((crushedBlackPixelsOriginal / totalPixels) * 100).toFixed(2)
      ),
      minHexOriginal,
      minHexCompensated,
      aspectRatioLabel: aspectCompliant ? "3:4" : `${width}×${height}`,
      aspectCompliant,
      estimatedInkLoadPercent: Number(
        ((inkLoadSum / totalPixels) * 100).toFixed(1)
      ),
    },
  };
}
