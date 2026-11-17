import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGtaViSpec,
  validateGtaViSpec,
  buildGtaViImagePrompt,
  DEFAULT_GTA6_TUNING,
} from "./specBuilder.ts";

test("buildGtaViSpec produces strictly standardized Vice City fields and #1C102A max_black_hex", () => {
  const features =
    "Mulher jovem de pele clara, olhos claros (azul-acinzentados), sobrancelhas arqueadas castanhas e cabelos longos, castanho-avermelhados, levemente ondulados e repartidos ao meio, sem barba.";
  const spec = buildGtaViSpec(features);

  assert.equal(spec.franchise_style, "GTA_VI_VICE_CITY");
  assert.equal(
    spec.art_direction.rendering_technique,
    "saturated_semi_realistic_2d_key_art"
  );
  assert.equal(spec.art_direction.linework, "bold_brush_and_ink_outlines");
  assert.equal(spec.art_direction.lighting_mood, "tropical_neon_and_sunset_rim");
  assert.deepEqual(spec.art_direction.color_palette_hex, [
    "#1C102A",
    "#8B1E4F",
    "#D93B58",
    "#F28C38",
    "#327A8A",
  ]);
  assert.deepEqual(spec.art_direction.background_elements, [
    "vice_city_skyline",
    "palm_tree_silhouettes",
    "art_deco_coastal_sunset",
    "soft_vignette_fade",
  ]);
  assert.equal(
    spec.art_direction.texture_overlay,
    "painted_brushstrokes_and_film_grain"
  );
  assert.equal(
    spec.subject_preservation.facial_likeness_priority,
    "MAXIMUM_100_PERCENT"
  );
  assert.equal(
    spec.subject_preservation.expression_applied,
    "confident_coastal_protagonist_stare"
  );
  assert.equal(spec.subject_preservation.detected_user_features, features);
  assert.equal(spec.sublimation_print_specs.aspect_ratio, "3:4");
  assert.equal(spec.sublimation_print_specs.color_profile, "sRGB");
  assert.equal(spec.sublimation_print_specs.black_point_compensation, true);
  assert.equal(spec.sublimation_print_specs.max_black_hex, "#1C102A");
  assert.equal(
    spec.sublimation_print_specs.edge_treatment,
    "feathered_fade_for_fabric"
  );
  assert.equal(spec.sublimation_print_specs.no_text_or_hud, true);

  const validation = validateGtaViSpec(spec);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});

test("validateGtaViSpec rejects tampered immutable parameters", () => {
  const spec = buildGtaViSpec("cabelo longo ruivo, sem barba");
  const tampered = {
    ...spec,
    sublimation_print_specs: {
      ...spec.sublimation_print_specs,
      max_black_hex: "#000000",
    },
  };
  const validation = validateGtaViSpec(tampered);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.length > 0);
});

test("buildGtaViImagePrompt adapts to GTA 6 scene presets while enforcing #1C102A and zero text/HUD", () => {
  const overpassPrompt = buildGtaViImagePrompt(DEFAULT_GTA6_TUNING);
  assert.match(overpassPrompt, /GTA VI/);
  assert.match(overpassPrompt, /coastal sunset sky/i);
  assert.match(overpassPrompt, /#1C102A/);
  assert.match(overpassPrompt, /no text/i);

  const oceanDrivePrompt = buildGtaViImagePrompt({
    ...DEFAULT_GTA6_TUNING,
    sceneSetting: "art_deco_ocean_drive",
    lightingProfile: "golden_sunset",
  });
  assert.match(oceanDrivePrompt, /Ocean Drive Art Deco/i);
  assert.match(oceanDrivePrompt, /#327A8A/);
});

test("buildGtaViSpec includes custom_logo_overlay when enabled and enforces 7-char cap", () => {
  const specWithLogo = buildGtaViSpec("cabelo curto, barba aparada", {
    enabled: true,
    text: "LEONIDA999",
    paletteStyle: "official_vi",
    position: "bottom_center",
    showTopWordmark: true,
    topWordmarkScale: 1.15,
    topWordmarkOffsetX: -12,
    topWordmarkOffsetY: 8,
    topWordmarkLineGap: 0.82,
  });

  assert.equal(specWithLogo.sublimation_print_specs.no_text_or_hud, false);
  assert.deepEqual(specWithLogo.sublimation_print_specs.custom_logo_overlay, {
    enabled: true,
    text: "LEONIDA",
    palette_style: "official_vi",
    style: "GTA_VI_SUNSET_GRADIENT_OUTLINE",
    position: "bottom_center",
    top_wordmark: true,
    top_wordmark_adjustments: {
      scale: 1.15,
      offset_x: -12,
      offset_y: 8,
      line_gap: 0.82,
    },
  });
  assert.equal(validateGtaViSpec(specWithLogo).valid, true);

  const oversizedOverlay = {
    ...specWithLogo,
    sublimation_print_specs: {
      ...specWithLogo.sublimation_print_specs,
      custom_logo_overlay: {
        ...specWithLogo.sublimation_print_specs.custom_logo_overlay!,
        text: "TOOLONG8",
      },
    },
  };
  const invalidCheck = validateGtaViSpec(oversizedOverlay);
  assert.equal(invalidCheck.valid, false);
  assert.ok(invalidCheck.errors.some((e) => e.includes("7 caracteres")));
});

