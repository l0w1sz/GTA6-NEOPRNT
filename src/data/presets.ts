import {
  buildGtaViSpec,
  type GtaViArtDirectionTuning,
  type GtaViSublimationSpec,
} from "../utils/specBuilder";
import type { BlackFloorHex } from "../utils/prepress";

export interface StudioPreset {
  id: string;
  recommendedBlackFloor: BlackFloorHex;
  recommendedTuning: GtaViArtDirectionTuning;
  title: string;
  subtitle: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  spec: GtaViSublimationSpec;
}

export const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: "vice-overpass-ref",
    recommendedBlackFloor: "#1C102A",
    recommendedTuning: {
      sceneSetting: "overpass_sunset",
      inkWeight: "bold",
      lightingProfile: "neon_magenta_rim",
      textureMode: "brush_and_grain",
      vignetteDepth: "soft",
    },
    title: "Viaduto & Neon",
    subtitle: "GTA VI · Referência oficial",
    originalImageUrl:
      "/src/assets/images/sample_photo_vice_woman_1794942956908.jpg",
    generatedImageUrl: "/assets/aistudio/image_4756adcb.png",
    spec: buildGtaViSpec(
      "Mulher jovem de pele clara, olhos claros (azul-acinzentados), sobrancelhas arqueadas castanhas e cabelos longos, castanho-avermelhados, levemente ondulados e repartidos ao meio, sem barba."
    ),
  },
  {
    id: "vice-coastal-sunset",
    recommendedBlackFloor: "#1C102A",
    recommendedTuning: {
      sceneSetting: "palm_beach_golden",
      inkWeight: "bold",
      lightingProfile: "golden_sunset",
      textureMode: "brush_and_grain",
      vignetteDepth: "soft",
    },
    title: "Praia & Palmeiras",
    subtitle: "GTA VI · Orla Golden Hour",
    originalImageUrl:
      "/src/assets/images/sample_photo_vice_woman_1794942956908.jpg",
    generatedImageUrl:
      "/src/assets/images/sample_gta_vice_woman_1794942972457.jpg",
    spec: buildGtaViSpec(
      "Mulher jovem de pele clara, olhos azul-acinzentados, sobrancelhas arqueadas, cabelos longos castanho-avermelhados ondulados repartidos ao meio, camisa coral sobre regata branca, sem barba."
    ),
  },
  {
    id: "vice-ocean-drive",
    recommendedBlackFloor: "#1C102A",
    recommendedTuning: {
      sceneSetting: "art_deco_ocean_drive",
      inkWeight: "bold",
      lightingProfile: "neon_magenta_rim",
      textureMode: "brush_and_grain",
      vignetteDepth: "soft",
    },
    title: "Ocean Drive Art Déco",
    subtitle: "GTA VI · Rim Magenta & Couro",
    originalImageUrl:
      "/src/assets/images/sample_photo_leather_1794941850452.jpg",
    generatedImageUrl:
      "/src/assets/images/sample_gta6_leather_clean_1794943700893.jpg",
    spec: buildGtaViSpec(
      "Homem jovem de pele clara, cabelo castanho escuro curto repicado, barba por fazer rala, jaqueta de couro marrom escuro sobre camiseta grafite."
    ),
  },
  {
    id: "vice-twilight-overpass",
    recommendedBlackFloor: "#1C102A",
    recommendedTuning: {
      sceneSetting: "neon_strip_twilight",
      inkWeight: "bold",
      lightingProfile: "twilight_plum",
      textureMode: "brush_and_grain",
      vignetteDepth: "soft",
    },
    title: "Crepúsculo Violeta",
    subtitle: "GTA VI · Autoestrada & Névoa",
    originalImageUrl:
      "/src/assets/images/sample_photo_hoodie_1794941852416.jpg",
    generatedImageUrl:
      "/src/assets/images/sample_gta6_hoodie_clean_1794943702450.jpg",
    spec: buildGtaViSpec(
      "Homem de pele negra, cabelo crespo curto com degradê lateral, barba cheia escura aparada, moletom chumbo com capuz sob jaqueta utilitária oliva."
    ),
  },
];
