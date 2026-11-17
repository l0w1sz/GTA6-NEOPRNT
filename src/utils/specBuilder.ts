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
    no_text_or_hud: true;
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
  { hex: "#1C102A", role: "Preto Máximo Violeta (Plum)" },
  { hex: "#8B1E4F", role: "Magenta Profundo / Neon" },
  { hex: "#D93B58", role: "Coral Carmesim / Rim Light" },
  { hex: "#F28C38", role: "Laranja Pôr do Sol Costeiro" },
  { hex: "#327A8A", role: "Azul-Turquesa Vice City" },
];

export const GTA6_SCENE_OPTIONS: {
  id: GtaViSceneSetting;
  label: string;
  description: string;
}[] = [
  {
    id: "overpass_sunset",
    label: "Viaduto & Neon",
    description: "Viaduto urbano, fios elétricos, prédios Art Déco e névoa #1C102A",
  },
  {
    id: "art_deco_ocean_drive",
    label: "Ocean Drive Art Déco",
    description: "Fachadas Art Déco pastel, palmeiras e horizonte costeiro",
  },
  {
    id: "palm_beach_golden",
    label: "Praia & Palmeiras",
    description: "Orla tropical dourada ao entardecer com mar turquesa #327A8A",
  },
  {
    id: "neon_strip_twilight",
    label: "Crepúsculo Violeta",
    description: "Céu roxo-magenta intenso com reflexos neon na avenida",
  },
];

export const DEFAULT_GTA6_TUNING: GtaViArtDirectionTuning = {
  sceneSetting: "overpass_sunset",
  inkWeight: "bold",
  lightingProfile: "neon_magenta_rim",
  textureMode: "brush_and_grain",
  vignetteDepth: "soft",
};

export function buildGtaViSpec(detectedUserFeatures: string): GtaViSublimationSpec {
  const cleanedFeatures = detectedUserFeatures.trim().replace(/\s+/g, " ");
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
      no_text_or_hud: true,
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
    if (print.no_text_or_hud !== true) {
      errors.push("no_text_or_hud deve ser true.");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function buildGtaViImagePrompt(
  tuning: GtaViArtDirectionTuning = DEFAULT_GTA6_TUNING
): string {
  const sceneMap: Record<GtaViSceneSetting, string> = {
    overpass_sunset:
      "Background shows a Vice City elevated coastal highway overpass bridge, utility poles with silhouette power lines crossing a glowing pink-orange sunset sky, Art Deco buildings, and palm tree silhouettes rising through deep #1C102A purple mist at the bottom",
    art_deco_ocean_drive:
      "Background shows Vice City Ocean Drive Art Deco hotels in pastel coral and cyan, palm tree silhouettes, and a glowing coastal sunset horizon without any signs or text",
    palm_beach_golden:
      "Background shows a tropical Vice Beach shoreline with turquoise water (#327A8A), tall palm tree silhouettes, distant Art Deco skyline, and a warm sunset horizon",
    neon_strip_twilight:
      "Background shows a Vice City coastal twilight strip with glowing magenta (#8B1E4F) and teal (#327A8A) ambient reflections, palm silhouettes, and purple twilight fog",
  };

  const inkClause =
    tuning.inkWeight === "bold"
      ? "bold expressive black-plum ink outlines and confident comic brush linework"
      : "clean refined brush-and-ink outlines with saturated digital painting transitions";

  const lightingMap: Record<GtaViLightingProfile, string> = {
    neon_magenta_rim:
      "strong tropical neon magenta (#8B1E4F) and crimson coral (#D93B58) rim lighting along the hair, cheek, and jacket edge, balanced with sunset orange (#F28C38) glow and coastal teal (#327A8A) shadows",
    golden_sunset:
      "warm sunset tangerine (#F28C38) backlighting and coastal teal (#327A8A) fill shadows with subtle magenta (#8B1E4F) rim accents",
    twilight_plum:
      "moody twilight plum (#1C102A) atmosphere lit by vivid coral (#D93B58) and neon magenta (#8B1E4F) key highlights",
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
