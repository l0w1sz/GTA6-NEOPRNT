import {
  clampRange,
  computeAdaptiveFontSize,
  computeLogoAnchor,
  LOGO_PALETTE_OPTIONS,
  sanitizeLogoText,
  type GtaViLogoConfig,
} from "./logoLayout";

/**
 * Renders the GTA VI Vice City emblem onto a 2D canvas matching the attached
 * official key art proportions:
 * - Bold geometric sans display ("VI" or custom phrase up to 7 chars)
 * - Outer deep violet-plum #1C102A stroke + crisp gold/coral rim border
 * - Multi-stop Vice City twilight/sunset gradient fill
 * - Adjustable stacked "grand / theft / auto" condensed wordmark (Anton)
 */
export function drawGtaViLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: GtaViLogoConfig
): void {
  const displayText = sanitizeLogoText(config.text).trim();
  if (!config.enabled || displayText.length === 0) return;

  const anchor = computeLogoAnchor(width, height, config.position, config.scale);
  const fontSize = computeAdaptiveFontSize(anchor.fontSize, displayText.length);
  const upperText = displayText.toUpperCase();

  const palette =
    LOGO_PALETTE_OPTIONS.find((p) => p.id === config.paletteStyle) ??
    LOGO_PALETTE_OPTIONS[0];

  ctx.save();
  ctx.textAlign = anchor.align;
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "miter";
  ctx.miterLimit = 3;

  // Bold wide geometric display font matching GTA VI cover emblem
  ctx.font = `900 ${fontSize}px "Montserrat", "Archivo", system-ui, sans-serif`;

  const metrics = ctx.measureText(upperText);
  const textWidth = Math.max(40, metrics.width);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
  const topY = anchor.y - ascent;

  // 1. Deep plum drop glow + heavy sublimation-safe outer border (#1C102A)
  ctx.save();
  ctx.shadowColor = "rgba(28, 16, 42, 0.85)";
  ctx.shadowBlur = Math.round(fontSize * 0.14);
  ctx.shadowOffsetY = Math.round(fontSize * 0.03);
  ctx.strokeStyle = "#1C102A";
  ctx.lineWidth = Math.max(8, Math.round(fontSize * 0.1));
  ctx.strokeText(upperText, anchor.x, anchor.y);
  ctx.restore();

  // 2. Crisp gold / sunset inner rim stroke around the emblem (official GTA VI look)
  ctx.strokeStyle = palette.rimHex;
  ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.055));
  ctx.strokeText(upperText, anchor.x, anchor.y);

  // 3. Multi-stop Vice City gradient fill
  const grad = ctx.createLinearGradient(0, topY, 0, anchor.y + 4);
  grad.addColorStop(0.0, palette.stops[0]);
  grad.addColorStop(0.35, palette.stops[1]);
  grad.addColorStop(0.68, palette.stops[2]);
  grad.addColorStop(1.0, palette.stops[3]);

  ctx.fillStyle = grad;
  ctx.fillText(upperText, anchor.x, anchor.y);

  const startX =
    anchor.align === "center"
      ? anchor.x - textWidth / 2
      : anchor.align === "right"
        ? anchor.x - textWidth
        : anchor.x;

  // 4. Adjustable stacked "grand / theft / auto" wordmark
  if (config.showTopWordmark) {
    const safeWordmarkScale = clampRange(config.topWordmarkScale, 0.6, 1.45);
    const safeOffsetX = clampRange(config.topWordmarkOffsetX, -80, 80);
    const safeOffsetY = clampRange(config.topWordmarkOffsetY, -80, 80);
    const safeLineGap = clampRange(config.topWordmarkLineGap, 0.68, 1.05);

    const baseSubSize =
      displayText.length <= 3
        ? Math.round(fontSize * 0.24)
        : Math.max(15, Math.round(fontSize * 0.28));
    const subSize = Math.max(12, Math.round(baseSubSize * safeWordmarkScale));
    const lineHeight = Math.round(subSize * safeLineGap);
    const lines = ["grand", "theft", "auto"];

    const stackCenterX = startX + textWidth * 0.5 + safeOffsetX;
    // Default position matches official GTA VI cover (centered across the emblem) for <=3 chars,
    // and rests cleanly above custom 4-7 char words so both remain crisp.
    const defaultStartY =
      displayText.length <= 3
        ? topY + ascent * 0.44 - lineHeight * 0.45
        : topY - lineHeight * 1.9;
    const stackStartY = defaultStartY + safeOffsetY;

    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.font = `400 ${subSize}px "Anton", "Archivo", system-ui, sans-serif`;

    lines.forEach((word, idx) => {
      const ly = stackStartY + idx * lineHeight;
      ctx.strokeStyle = "#1C102A";
      ctx.lineWidth = Math.max(5, Math.round(subSize * 0.24));
      ctx.strokeText(word, stackCenterX, ly);

      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(word, stackCenterX, ly);
    });
  }

  ctx.restore();
}
