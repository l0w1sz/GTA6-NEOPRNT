import React from "react";
import { Upload } from "lucide-react";
import {
  BLACK_FLOOR_OPTIONS,
  type BlackFloorHex,
  type PrepressAudit,
  type PrepressOptions,
} from "../utils/prepress";
import {
  GTA6_SCENE_OPTIONS,
  type GtaViArtDirectionTuning,
  type GtaViInkWeight,
  type GtaViLightingProfile,
  type GtaViSceneSetting,
  type GtaViTextureMode,
} from "../utils/specBuilder";
import type { StudioPreset } from "../data/presets";

interface PrepressWorkspaceProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  presets: StudioPreset[];
  activePresetId: string | null;
  customFileName: string | null;
  originalPreviewUrl: string;
  onSelectPreset: (preset: StudioPreset) => void;
  onFileSelected: (file: File) => void;
  tuning: GtaViArtDirectionTuning;
  onTuningChange: (next: GtaViArtDirectionTuning) => void;
  prepressOptions: PrepressOptions;
  onPrepressChange: (next: PrepressOptions) => void;
  audit: PrepressAudit | null;
}

export const PrepressWorkspace: React.FC<PrepressWorkspaceProps> = ({
  fileInputRef,
  presets,
  activePresetId,
  customFileName,
  originalPreviewUrl,
  onSelectPreset,
  onFileSelected,
  tuning,
  onTuningChange,
  prepressOptions,
  onPrepressChange,
  audit,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelected(file);
    }
  };

  return (
    <aside
      id="prepress"
      aria-label="Controles de Direção de Arte GTA VI e Pré-Impressão"
      className="flex flex-col gap-5 rounded-xl border border-white/10 bg-[#18191E] p-5"
    >
      {/* 1. Photo Input & GTA 6 Reference Samples */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-[#F4F4F5]">
            Foto de Entrada
          </h2>
          <span className="text-xs text-[#A1A1AA]">
            {customFileName ? customFileName : "Referência GTA VI"}
          </span>
        </div>

        <input
          ref={fileInputRef}
          id="photo-upload-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleInputChange}
          aria-label="Carregar foto do usuário para transformação GTA VI Vice City"
          className="sr-only"
        />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="mt-2.5 flex items-center gap-4 rounded-lg border border-dashed border-white/15 bg-[#121316] p-3.5"
        >
          <div className="h-16 w-12 shrink-0 overflow-hidden rounded border border-white/10 bg-[#1C102A]">
            <img
              src={originalPreviewUrl}
              alt="Miniatura da foto de entrada"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#F4F4F5]">
              Arraste uma foto frontal ou selecione do dispositivo
            </p>
            <p className="mt-0.5 text-xs text-[#A1A1AA]">
              PNG, JPG ou WEBP · Enquadramento automático 3:4 da cintura para cima
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#D98A3C] hover:text-[#E8A55D] cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Escolher arquivo de foto</span>
            </button>
          </div>
        </div>

        {/* Preset Switcher — 100% GTA VI Vice City */}
        <div className="mt-3">
          <p className="mb-2 text-xs font-medium text-[#A1A1AA]">
            Amostras calibradas GTA VI (Vice City)
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {presets.map((preset) => {
              const selected = activePresetId === preset.id && !customFileName;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`flex flex-col items-start rounded-lg border p-2 text-left transition-colors cursor-pointer ${
                    selected
                      ? "border-[#D93B58] bg-[#D93B58]/10"
                      : "border-white/10 bg-[#121316] hover:border-white/25"
                  }`}
                >
                  <span className="w-full truncate text-xs font-semibold text-[#F4F4F5]">
                    {preset.title}
                  </span>
                  <span className="mt-0.5 w-full truncate text-[11px] text-[#A1A1AA]">
                    {preset.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* 2. GTA VI Vice City Art Direction Options */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-[#F4F4F5]">
            Características GTA VI (Vice City)
          </h3>
          <span className="font-mono text-[11px] text-[#A1A1AA]">
            GTA_VI_VICE_CITY
          </span>
        </div>

        {/* Scene / Background Setting */}
        <div className="mt-3">
          <span className="block text-xs font-medium text-[#A1A1AA]">
            Cenário &amp; Ambientação Vice City
          </span>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {GTA6_SCENE_OPTIONS.map((scene) => {
              const active = tuning.sceneSetting === scene.id;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() =>
                    onTuningChange({
                      ...tuning,
                      sceneSetting: scene.id as GtaViSceneSetting,
                    })
                  }
                  aria-pressed={active}
                  className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                    active
                      ? "border-[#D93B58] bg-[#D93B58]/10"
                      : "border-white/10 bg-[#121316] hover:border-white/25"
                  }`}
                >
                  <span className="text-xs font-semibold text-[#F4F4F5]">
                    {scene.label}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-[11px] text-[#A1A1AA]">
                    {scene.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Linework, Lighting Rim & Texture */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="gta6-lighting"
              className="block text-xs font-medium text-[#A1A1AA]"
            >
              Iluminação Tropical &amp; Rim
            </label>
            <select
              id="gta6-lighting"
              value={tuning.lightingProfile}
              onChange={(e) =>
                onTuningChange({
                  ...tuning,
                  lightingProfile: e.target.value as GtaViLightingProfile,
                })
              }
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121316] px-3 py-2 text-xs font-medium text-[#F4F4F5] focus:border-[#D93B58] focus:outline-none"
            >
              <option value="neon_magenta_rim">
                Rim Neon Magenta &amp; Pôr do Sol
              </option>
              <option value="golden_sunset">
                Golden Hour &amp; Turquesa Costeiro
              </option>
              <option value="twilight_plum">
                Crepúsculo Violeta (#1C102A)
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="gta6-ink-weight"
              className="block text-xs font-medium text-[#A1A1AA]"
            >
              Traço &amp; Pincelada (Linework)
            </label>
            <select
              id="gta6-ink-weight"
              value={tuning.inkWeight}
              onChange={(e) =>
                onTuningChange({
                  ...tuning,
                  inkWeight: e.target.value as GtaViInkWeight,
                })
              }
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121316] px-3 py-2 text-xs font-medium text-[#F4F4F5] focus:border-[#D93B58] focus:outline-none"
            >
              <option value="bold">Pincel &amp; Tinta Marcada (Key Art)</option>
              <option value="editorial">Contorno Editorial Saturado</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="gta6-texture"
              className="block text-xs font-medium text-[#A1A1AA]"
            >
              Acabamento &amp; Textura de Impressão
            </label>
            <select
              id="gta6-texture"
              value={tuning.textureMode}
              onChange={(e) =>
                onTuningChange({
                  ...tuning,
                  textureMode: e.target.value as GtaViTextureMode,
                })
              }
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121316] px-3 py-2 text-xs font-medium text-[#F4F4F5] focus:border-[#D93B58] focus:outline-none"
            >
              <option value="brush_and_grain">
                Pinceladas Visíveis + Grão de Filme
              </option>
              <option value="clean_key_art">
                Pintura Digital Saturada + Grão Fino
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* 3. Sublimation Pre-Press Engineering */}
      <div>
        <h3 className="font-display text-sm font-semibold text-[#F4F4F5]">
          Engenharia de Pré-Impressão (Sublimação)
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
          Mantém o preto máximo em{" "}
          <span className="font-mono text-[#D4D4D8]">#1C102A</span> (violeta
          profundo) evitando <span className="font-mono text-[#D4D4D8]">#000000</span>{" "}
          puro para impedir excesso de tinta e aspecto emborrachado no poliéster.
        </p>

        {/* Black Floor Selector */}
        <div className="mt-3 space-y-2">
          <span className="block text-xs font-medium text-[#A1A1AA]">
            Piso Mínimo de Preto Seguro (max_black_hex)
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {BLACK_FLOOR_OPTIONS.map((opt) => {
              const active = prepressOptions.blackFloorHex === opt.hex;
              return (
                <button
                  key={opt.hex}
                  type="button"
                  onClick={() =>
                    onPrepressChange({
                      ...prepressOptions,
                      blackFloorHex: opt.hex as BlackFloorHex,
                    })
                  }
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors cursor-pointer ${
                    active
                      ? "border-[#D93B58] bg-[#D93B58]/10"
                      : "border-white/10 bg-[#121316] hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 rounded border border-white/20"
                      style={{ backgroundColor: opt.hex }}
                    />
                    <span className="font-mono text-xs font-medium text-[#F4F4F5]">
                      {opt.label}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-[11px] text-[#A1A1AA]">
                    {opt.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-4 space-y-2.5">
          <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#121316] px-3 py-2.5 cursor-pointer">
            <div>
              <span className="block text-xs font-medium text-[#F4F4F5]">
                Compensação de Ponto Preto
              </span>
              <span className="block text-[11px] text-[#A1A1AA]">
                Eleva sombras abaixo de 48 para {prepressOptions.blackFloorHex}
              </span>
            </div>
            <input
              type="checkbox"
              checked={prepressOptions.applyBlackCompensation}
              onChange={(e) =>
                onPrepressChange({
                  ...prepressOptions,
                  applyBlackCompensation: e.target.checked,
                })
              }
              className="h-4 w-4 accent-[#D93B58] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#121316] px-3 py-2.5 cursor-pointer">
            <div>
              <span className="block text-xs font-medium text-[#F4F4F5]">
                Vinheta Esfumaçada para Tecido
              </span>
              <span className="block text-[11px] text-[#A1A1AA]">
                Suaviza as bordas 3:4 evitando recorte quadrado na camiseta
              </span>
            </div>
            <input
              type="checkbox"
              checked={prepressOptions.applyFeatheredVignette}
              onChange={(e) =>
                onPrepressChange({
                  ...prepressOptions,
                  applyFeatheredVignette: e.target.checked,
                })
              }
              className="h-4 w-4 accent-[#D93B58] cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* 4. Real-Time Pre-Press Audit Readout */}
      <div>
        <h3 className="font-display text-sm font-semibold text-[#F4F4F5]">
          Auditoria de Pré-Impressão (Tempo Real)
        </h3>
        <dl className="mt-3 divide-y divide-white/8 rounded-lg border border-white/10 bg-[#121316] text-xs">
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <dt className="text-[#A1A1AA]">Pixels abaixo de #141416 (Original)</dt>
            <dd
              data-testid="audit-crushed-percent"
              className="font-mono font-semibold text-[#F4F4F5] tabular-nums"
            >
              {audit ? `${audit.crushedBlackPercentOriginal.toFixed(2)}%` : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <dt className="text-[#A1A1AA]">Mínimo Original → Compensado</dt>
            <dd
              data-testid="audit-min-hex"
              className="font-mono font-semibold text-[#F28C38] tabular-nums"
            >
              {audit
                ? `${audit.minHexOriginal} → ${audit.minHexCompensated}`
                : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <dt className="text-[#A1A1AA]">Densidade Estimada de Tinta</dt>
            <dd className="font-mono font-medium text-[#F4F4F5] tabular-nums">
              {audit ? `${audit.estimatedInkLoadPercent.toFixed(1)}%` : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <dt className="text-[#A1A1AA]">Proporção · Perfil de Cor</dt>
            <dd className="font-mono font-medium text-[#F4F4F5] tabular-nums">
              {audit ? `${audit.aspectRatioLabel} · sRGB` : "3:4 · sRGB"}
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  );
};
