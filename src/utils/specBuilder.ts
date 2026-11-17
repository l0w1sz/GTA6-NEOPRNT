import type { LogoPaletteStyle, LogoPosition } from "./logoLayout.ts";

export type FranchiseStyle = "GTA_VI_VICE_CITY";

export type GtaViSceneSetting =
  | "overpass_sunset"
  | "art_deco_ocean_drive"
  | "palm_beach_golden"
  | "neon_strip_twilight";

export type GtaViLightingProfile =
  | "neon_magenta_rim"
  | "golden_sunset"
  | "twilight_plum";

export type GtaViInkWeight = "bold" | "editorial";
export type GtaViTextureMode = "brush_and_grain" | "clean_key_art";

export interface GtaViArtDirectionTuning {
  sceneSetting: GtaViSceneSetting;
  inkWeight: GtaViInkWeight;
  lightingProfile: GtaViLightingProfile;
  textureMode: GtaViTextureMode;
  vignetteDepth: "soft" | "deep";
}

export interface CustomLogoOverlaySpec {
  enabled: true;
  text: string;
  palette_style: LogoPaletteStyle;
  style: "GTA_VI_SUNSET_GRADIENT_OUTLINE";
  position: LogoPosition;
  top_wordmark: boolean;
  top_wordmark_adjustments?: {
    scale: number;
    offset_x: number;
    offset_y: number;
    line_gap: number;
  };
}

export interface GtaViSublimationSpec {
  franchise_style: "GTA_VI_VICE_CITY";
  art_direction: {
    rendering_technique: "saturated_semi_realistic_2d_key_art";
    linework: "bold_brush_and_ink_outlines";
    lighting_mood: "tropical_neon_and_sunset_rim";
    color_palette_hex: [
      "#1C102A",
      "#8B1E4F",
      "#D93B58",
      "#F28C38",
      "#327A8A"
    ];
    background_elements: [
      "vice_city_skyline",
      "palm_tree_silhouettes",
      "art_deco_coastal_sunset",
      "soft_vignette_fade"
    ];
    texture_overlay: "painted_brushstrokes_and_film_grain";
  };
  subject_preservation: {
    facial_likeness_priority: "MAXIMUM_100_PERCENT";
    expression_applied: "confident_coastal_protagonist_stare";
    detected_user_features: string;
  };
  sublimation_print_specs: {
    aspect_ratio: "3:4";
    color_profile: "sRGB";
    black_point_compensation: true;
    max_black_hex: "#1C102A";
    edge_treatment: "feathered_fade_for_fabric";
    no_text_or_hud: boolean;
    custom_logo_overlay?: CustomLogoOverlaySpec;
  };
}

export type SublimationSpec = GtaViSublimationSpec;

export const FIXED_VICE_PALETTE_HEX = [
  "#1C102A",
  "#8B1E4F",
  "#D93B58",
  "#F28C38",
  "#327A8A",
] as const;

export const FIXED_VICE_BACKGROUND_ELEMENTS = [
  "vice_city_skyline",
  "palm_tree_silhouettes",
  "art_deco_coastal_sunset",
  "soft_vignette_fade",
] as const;

export const GTA6_SWATCHES: readonly { hex: string; role: string }[] = [
  { hex: "#1C102A", role: "Plum Sombra Máxima (Sublimação)" },
  { hex: "#4E6CF0", role: "Céu Crepúsculo / Gradiente VI" },
  { hex: "#F03FA8", role: "Magenta Flamingo Neon" },
  { hex: "#F9A66C", role: "Pêssego & Ouro Pôr do Sol" },
  { hex: "#3CC4B8", role: "Turquesa Costeiro Vice Beach" },
];

export const GTA6_SCENE_OPTIONS: {
  id: GtaViSceneSetting;
  label: string;
  description: string;
}[] = [
  {
    id: "overpass_sunset",
    label: "Capa Pôr do Sol & Neon",
    description: "Céu azul-violeta a rosa, palmeiras e prédios Art Déco",
  },
  {
    id: "palm_beach_golden",
    label: "Orla Ocean Teal",
    description: "Mar turquesa, skyline distante e entardecer pastel",
  },
  {
    id: "art_deco_ocean_drive",
    label: "Ocean Drive & Carro",
    description: "Fachadas pastel, palmeiras e luz quente lateral",
  },
  {
    id: "neon_strip_twilight",
    label: "Crepúsculo Leonida",
    description: "Fios elétricos, névoa roxo-rosa e luz de estrada",
  },
];

export const DEFAULT_GTA6_TUNING: GtaViArtDirectionTuning = {
  sceneSetting: "overpass_sunset",
  inkWeight: "bold",
  lightingProfile: "neon_magenta_rim",
  textureMode: "brush_and_grain",
  vignetteDepth: "soft",
};

export interface BuildLogoOverlayInput {
  enabled: boolean;
  text: string;
  paletteStyle?: LogoPaletteStyle;
  position: LogoPosition;
  showTopWordmark: boolean;
  topWordmarkScale?: number;
  topWordmarkOffsetX?: number;
  topWordmarkOffsetY?: number;
  topWordmarkLineGap?: number;
}

export function buildGtaViSpec(
  detectedUserFeatures: string,
  logoOverlay?: BuildLogoOverlayInput
): GtaViSublimationSpec {
  const cleanedFeatures = detectedUserFeatures.trim().replace(/\s+/g, " ");
  const hasActiveLogo =
    Boolean(logoOverlay?.enabled) &&
    (logoOverlay?.text.trim().length ?? 0) > 0;
  const cappedText = (logoOverlay?.text ?? "").slice(0, 7);

  return {
    franchise_style: "GTA_VI_VICE_CITY",
    art_direction: {
      rendering_technique: "saturated_semi_realistic_2d_key_art",
      linework: "bold_brush_and_ink_outlines",
      lighting_mood: "tropical_neon_and_sunset_rim",
      color_palette_hex: [
        "#1C102A",
        "#8B1E4F",
        "#D93B58",
        "#F28C38",
        "#327A8A",
      ],
      background_elements: [
        "vice_city_skyline",
        "palm_tree_silhouettes",
        "art_deco_coastal_sunset",
        "soft_vignette_fade",
      ],
      texture_overlay: "painted_brushstrokes_and_film_grain",
    },
    subject_preservation: {
      facial_likeness_priority: "MAXIMUM_100_PERCENT",
      expression_applied: "confident_coastal_protagonist_stare",
      detected_user_features:
        cleanedFeatures.length > 0
          ? cleanedFeatures
          : "Traços faciais, olhos, cabelo e vestimenta preservados da foto original",
    },
    sublimation_print_specs: {
      aspect_ratio: "3:4",
      color_profile: "sRGB",
      black_point_compensation: true,
      max_black_hex: "#1C102A",
      edge_treatment: "feathered_fade_for_fabric",
      no_text_or_hud: !hasActiveLogo,
      ...(hasActiveLogo
        ? {
            custom_logo_overlay: {
              enabled: true,
              text: cappedText,
              palette_style: logoOverlay?.paletteStyle ?? "official_vi",
              style: "GTA_VI_SUNSET_GRADIENT_OUTLINE",
              position: logoOverlay?.position ?? "bottom_center",
              top_wordmark: Boolean(logoOverlay?.showTopWordmark),
              ...(logoOverlay?.showTopWordmark
                ? {
                    top_wordmark_adjustments: {
                      scale: Number((logoOverlay.topWordmarkScale ?? 1).toFixed(2)),
                      offset_x: Math.round(logoOverlay.topWordmarkOffsetX ?? 0),
                      offset_y: Math.round(logoOverlay.topWordmarkOffsetY ?? 0),
                      line_gap: Number(
                        (logoOverlay.topWordmarkLineGap ?? 0.78).toFixed(2)
                      ),
                    },
                  }
                : {}),
            },
          }
        : {}),
    },
  };
}

export function validateGtaViSpec(candidate: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!candidate || typeof candidate !== "object") {
    return { valid: false, errors: ["Spec deve ser um objeto JSON válido."] };
  }
  const s = candidate as Record<string, unknown>;
  if (s.franchise_style !== "GTA_VI_VICE_CITY") {
    errors.push("franchise_style deve ser GTA_VI_VICE_CITY.");
  }

  const art = s.art_direction as Record<string, unknown> | undefined;
  const subj = s.subject_preservation as Record<string, unknown> | undefined;
  const print = s.sublimation_print_specs as Record<string, unknown> | undefined;

  if (!art || typeof art !== "object") {
    errors.push("art_direction ausente.");
  } else {
    if (art.rendering_technique !== "saturated_semi_realistic_2d_key_art") {
      errors.push("rendering_technique inválido.");
    }
    if (art.linework !== "bold_brush_and_ink_outlines") {
      errors.push("linework inválido.");
    }
    if (art.lighting_mood !== "tropical_neon_and_sunset_rim") {
      errors.push("lighting_mood inválido.");
    }
    if (
      !Array.isArray(art.color_palette_hex) ||
      JSON.stringify(art.color_palette_hex) !==
        JSON.stringify(FIXED_VICE_PALETTE_HEX)
    ) {
      errors.push("color_palette_hex divergente do padrão GTA VI.");
    }
    if (
      !Array.isArray(art.background_elements) ||
      JSON.stringify(art.background_elements) !==
        JSON.stringify(FIXED_VICE_BACKGROUND_ELEMENTS)
    ) {
      errors.push("background_elements divergente do padrão GTA VI.");
    }
    if (art.texture_overlay !== "painted_brushstrokes_and_film_grain") {
      errors.push("texture_overlay inválido.");
    }
  }

  if (!subj || typeof subj !== "object") {
    errors.push("subject_preservation ausente.");
  } else {
    if (subj.facial_likeness_priority !== "MAXIMUM_100_PERCENT") {
      errors.push("facial_likeness_priority inválido.");
    }
    if (subj.expression_applied !== "confident_coastal_protagonist_stare") {
      errors.push("expression_applied inválido.");
    }
    if (
      typeof subj.detected_user_features !== "string" ||
      subj.detected_user_features.trim().length < 3
    ) {
      errors.push("detected_user_features deve descrever os traços da foto.");
    }
  }

  if (!print || typeof print !== "object") {
    errors.push("sublimation_print_specs ausente.");
  } else {
    if (print.aspect_ratio !== "3:4") errors.push("aspect_ratio deve ser 3:4.");
    if (print.color_profile !== "sRGB") errors.push("color_profile deve ser sRGB.");
    if (print.black_point_compensation !== true) {
      errors.push("black_point_compensation deve ser true.");
    }
    if (print.max_black_hex !== "#1C102A") {
      errors.push("max_black_hex deve ser #1C102A.");
    }
    if (print.edge_treatment !== "feathered_fade_for_fabric") {
      errors.push("edge_treatment inválido.");
    }
    if (typeof print.no_text_or_hud !== "boolean") {
      errors.push("no_text_or_hud deve ser booleano.");
    }
    const overlay = print.custom_logo_overlay as
      | Record<string, unknown>
      | undefined;
    if (overlay) {
      if (typeof overlay.text !== "string" || overlay.text.length > 7) {
        errors.push("Texto do logo deve ter no máximo 7 caracteres.");
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function buildGtaViImagePrompt(
  tuning: GtaViArtDirectionTuning = DEFAULT_GTA6_TUNING
): string {
  const sceneMap: Record<GtaViSceneSetting, string> = {
    overpass_sunset:
      "Background shows a Vice City coastal sunset sky transitioning from periwinkle twilight blue (#4E6CF0) through violet-magenta (#8B1E4F / #F03FA8) into peach-gold horizon (#F9A66C), with Art Deco pastel buildings, palm tree silhouettes, and deep #1C102A purple mist at the bottom",
    art_deco_ocean_drive:
      "Background shows Vice City Ocean Drive Art Deco hotels in pastel peach and turquoise, palm tree silhouettes, and a glowing coastal sunset horizon without any signs or text",
    palm_beach_golden:
      "Background shows a tropical Vice Beach shoreline with turquoise water (#327A8A), distant Art Deco skyline, tall palm tree silhouettes, and a pastel peach-pink sunset sky",
    neon_strip_twilight:
      "Background shows a Leonida coastal twilight highway strip with utility wires against a glowing violet-rose sunset sky, palm silhouettes, and purple twilight fog",
  };

  const inkClause =
    tuning.inkWeight === "bold"
      ? "bold expressive dark-plum ink outlines and confident painted key-art shading"
      : "clean refined brush-and-ink outlines with saturated digital painting transitions";

  const lightingMap: Record<GtaViLightingProfile, string> = {
    neon_magenta_rim:
      "strong tropical neon magenta (#F03FA8 / #8B1E4F) and coral-peach (#F9A66C) rim lighting along the hair, jaw, and shoulders, balanced with twilight blue (#4E6CF0) and coastal teal (#327A8A) ambient shadows",
    golden_sunset:
      "warm sunset peach-gold (#F9A66C) backlighting and coastal teal (#327A8A) fill shadows with subtle flamingo-pink (#D93B58) rim accents",
    twilight_plum:
      "moody twilight plum (#1C102A) atmosphere lit by vivid coral (#D93B58) and neon orchid-magenta (#8B1E4F) key highlights",
  };

  const textureClause =
    tuning.textureMode === "brush_and_grain"
      ? "visible hand-painted brushstrokes and authentic subtle film grain texture"
      : "saturated semi-realistic 2D key art finish with fine film grain";

  const vignetteClause =
    tuning.vignetteDepth === "deep"
      ? "deep feathered #1C102A plum mist vignette fading smoothly around the lower torso and edges for t-shirt sublimation"
      : "soft feathered #1C102A plum vignette edges fading cleanly for t-shirt sublimation";

  return [
    "Transform the exact person in the attached photo into a saturated semi-realistic 2D digital painting in the iconic GTA VI (Vice City) cover art style.",
    "CRITICAL LIKENESS: Keep 100% of the exact facial features, bone structure, eye color, eyebrows, nose, skin tone, hair parting/texture, and facial hair from the original photo. Preserve their clothing and layered outfit rendered in painted key-art style. Give the person a confident coastal protagonist stare.",
    `FIXED GTA VI STYLE: ${inkClause}, ${textureClause}. Apply ${lightingMap[tuning.lightingProfile]}. Never use pure #000000 crushed black—anchor deepest shadows at #1C102A deep violet-plum for crisp fabric sublimation.`,
    `BACKGROUND & COMPOSITION: Medium waist-up portrait, centered in strict 3:4 aspect ratio. ${sceneMap[tuning.sceneSetting]}, with ${vignetteClause}.`,
    "STRICT EXCLUSIONS: Absolutely no text, no titles, no neon signs with letters, no logos, no HUD elements, no watermarks.",
  ].join(" ");
}
