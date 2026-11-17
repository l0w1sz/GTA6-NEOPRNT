import React, { useState } from "react";
import { RotateCcw, Upload } from "lucide-react";
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
import {
  DEFAULT_LOGO_CONFIG,
  LOGO_PALETTE_OPTIONS,
  MAX_LOGO_CHARS,
  sanitizeLogoText,
  type GtaViLogoConfig,
  type LogoPosition,
} from "../utils/logoLayout";
import type { StudioPreset } from "../data/presets";

type WorkspaceTab = "style" | "logo" | "prepress";

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
  logoConfig: GtaViLogoConfig;
  onLogoConfigChange: (next: GtaViLogoConfig) => void;
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
  logoConfig,
  onLogoConfigChange,
  prepressOptions,
  onPrepressChange,
  audit,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("style");

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

  const resetWordmarkAdjustments = () => {
    onLogoConfigChange({
      ...logoConfig,
      showTopWordmark: true,
      topWordmarkScale: DEFAULT_LOGO_CONFIG.topWordmarkScale,
      topWordmarkOffsetX: DEFAULT_LOGO_CONFIG.topWordmarkOffsetX,
      topWordmarkOffsetY: DEFAULT_LOGO_CONFIG.topWordmarkOffsetY,
      topWordmarkLineGap: DEFAULT_LOGO_CONFIG.topWordmarkLineGap,
    });
  };

  return (
    <aside
      id="prepress"
      aria-label="Controles GTA VI Vice City e Pré-Impressão"
      className="flex flex-col gap-4 rounded-xl border border-[#4E6CF0]/20 bg-[#1B112B] p-4 sm:p-5"
    >
      {/* Hidden File Input (always mounted so TopBar upload button always triggers it) */}
      <input
        ref={fileInputRef}
        id="photo-upload-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleInputChange}
        aria-label="Carregar foto do usuário para transformação GTA VI Vice City"
        className="sr-only"
      />

      {/* Objective 3-Tab Switcher */}
      <div
        role="tablist"
        aria-label="Etapas do estúdio GTA VI"
        className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-[#130B20] p-1"
      >
        {(
          [
            { id: "style", label: "1. Foto & Estilo" },
            { id: "logo", label: "2. Logo & Faixa" },
            { id: "prepress", label: "3. Pré-Impressão" },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-2.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-gradient-to-r from-[#F03FA8]/25 to-[#4E6CF0]/25 text-[#F8F4FF] ring-1 ring-[#F03FA8]/50"
                  : "text-[#B8A8D8] hover:text-[#F8F4FF]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Photo Upload + GTA VI Style Presets */}
      {activeTab === "style" && (
        <div className="space-y-4">
          {/* Compact Upload Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex items-center gap-3.5 rounded-lg border border-dashed border-[#4E6CF0]/35 bg-[#130B20] p-3"
          >
            <div className="h-16 w-12 shrink-0 overflow-hidden rounded border border-white/15 bg-[#1C102A]">
              <img
                src={originalPreviewUrl}
                alt="Miniatura da foto de entrada"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#F8F4FF]">
                {customFileName ? customFileName : "Foto de Entrada (3:4)"}
              </p>
              <p className="mt-0.5 text-[11px] text-[#B8A8D8]">
                Arraste uma foto frontal ou selecione do dispositivo
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#F9A66C] hover:text-[#FCD183] cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Trocar foto</span>
              </button>
            </div>
          </div>

          {/* 4 Visual GTA VI Presets with Thumbnails */}
          <div>
            <p className="mb-2 text-xs font-semibold text-[#C4B5E3]">
              Amostras &amp; Paletas GTA VI
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {presets.map((preset) => {
                const selected = activePresetId === preset.id && !customFileName;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectPreset(preset)}
                    className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-colors cursor-pointer ${
                      selected
                        ? "border-[#F03FA8] bg-[#F03FA8]/12"
                        : "border-white/10 bg-[#130B20] hover:border-[#4E6CF0]/50"
                    }`}
                  >
                    <img
                      src={preset.generatedImageUrl}
                      alt={preset.title}
                      referrerPolicy="no-referrer"
                      className="h-12 w-9 shrink-0 rounded object-cover border border-white/10"
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-[#F8F4FF]">
                        {preset.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-[#B8A8D8]">
                        {preset.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scene & Lighting */}
          <div className="space-y-3 border-t border-white/10 pt-3">
            <div>
              <span className="block text-xs font-semibold text-[#C4B5E3]">
                Cenário Vice City
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
                          ? "border-[#F03FA8] bg-[#F03FA8]/12"
                          : "border-white/10 bg-[#130B20] hover:border-[#4E6CF0]/45"
                      }`}
                    >
                      <span className="text-xs font-semibold text-[#F8F4FF]">
                        {scene.label}
                      </span>
                      <span className="mt-0.5 line-clamp-1 text-[11px] text-[#B8A8D8]">
                        {scene.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="gta6-lighting"
                  className="block text-xs font-medium text-[#C4B5E3]"
                >
                  Luz &amp; Rim
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
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#130B20] px-2.5 py-2 text-xs font-medium text-[#F8F4FF] focus:border-[#F03FA8] focus:outline-none"
                >
                  <option value="neon_magenta_rim">
                    Neon Magenta &amp; Pêssego
                  </option>
                  <option value="golden_sunset">
                    Sunset Ouro &amp; Turquesa
                  </option>
                  <option value="twilight_plum">
                    Crepúsculo Violeta (#1C102A)
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="gta6-ink-weight"
                  className="block text-xs font-medium text-[#C4B5E3]"
                >
                  Traço &amp; Textura
                </label>
                <select
                  id="gta6-ink-weight"
                  value={`${tuning.inkWeight}:${tuning.textureMode}`}
                  onChange={(e) => {
                    const [ink, tex] = e.target.value.split(":") as [
                      GtaViInkWeight,
                      GtaViTextureMode,
                    ];
                    onTuningChange({
                      ...tuning,
                      inkWeight: ink,
                      textureMode: tex,
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#130B20] px-2.5 py-2 text-xs font-medium text-[#F8F4FF] focus:border-[#F03FA8] focus:outline-none"
                >
                  <option value="bold:brush_and_grain">
                    Key Art Oficial + Grão
                  </option>
                  <option value="editorial:clean_key_art">
                    Editorial Limpo + Grão Fino
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GTA VI Logo, Custom 7-Char Text & "grand theft auto" Band Adjustments */}
      {activeTab === "logo" && (
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#130B20] px-3 py-2.5 cursor-pointer">
            <div>
              <span className="block text-xs font-semibold text-[#F8F4FF]">
                Exibir Logo Estilo GTA VI
              </span>
              <span className="block text-[11px] text-[#B8A8D8]">
                Proporção oficial de capa com contorno seguro #1C102A
              </span>
            </div>
            <input
              type="checkbox"
              data-testid="logo-enabled-toggle"
              checked={logoConfig.enabled}
              onChange={(e) =>
                onLogoConfigChange({
                  ...logoConfig,
                  enabled: e.target.checked,
                })
              }
              className="h-4 w-4 accent-[#F03FA8] cursor-pointer"
            />
          </label>

          {logoConfig.enabled && (
            <>
              {/* Custom 7-char text + quick chips */}
              <div className="rounded-lg border border-white/10 bg-[#130B20] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="gta6-logo-text"
                    className="text-xs font-medium text-[#C4B5E3]"
                  >
                    Texto principal (no lugar de &quot;VI&quot;, máx. 7)
                  </label>
                  <span
                    data-testid="logo-char-counter"
                    className="font-mono text-[11px] font-semibold text-[#F9A66C] tabular-nums"
                  >
                    {logoConfig.text.length}/{MAX_LOGO_CHARS}
                  </span>
                </div>
                <input
                  id="gta6-logo-text"
                  data-testid="logo-text-input"
                  type="text"
                  maxLength={MAX_LOGO_CHARS}
                  value={logoConfig.text}
                  onChange={(e) =>
                    onLogoConfigChange({
                      ...logoConfig,
                      text: sanitizeLogoText(e.target.value),
                    })
                  }
                  placeholder="VI"
                  className="w-full rounded-lg border border-white/15 bg-[#1B112B] px-3 py-2 font-mono text-sm font-bold tracking-wider text-[#F8F4FF] uppercase focus:border-[#F03FA8] focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                  {["VI", "VICE", "LEONIDA", "2026"].map((sample) => {
                    const active =
                      logoConfig.text.toUpperCase() === sample.toUpperCase();
                    return (
                      <button
                        key={sample}
                        type="button"
                        onClick={() =>
                          onLogoConfigChange({
                            ...logoConfig,
                            text: sanitizeLogoText(sample),
                          })
                        }
                        className={`rounded border px-2.5 py-1 font-mono text-[11px] font-semibold transition-colors cursor-pointer ${
                          active
                            ? "border-[#F03FA8] bg-[#F03FA8]/20 text-[#F8F4FF]"
                            : "border-white/10 bg-[#1B112B] text-[#B8A8D8] hover:border-white/25 hover:text-[#F8F4FF]"
                        }`}
                      >
                        {sample}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emblem Palette + Position + Scale */}
              <div className="rounded-lg border border-white/10 bg-[#130B20] p-3 space-y-3">
                <div>
                  <span className="block text-xs font-medium text-[#C4B5E3]">
                    Paleta do Emblema (Baseada nas Capas GTA VI)
                  </span>
                  <div className="mt-2 grid grid-cols-1 gap-1.5">
                    {LOGO_PALETTE_OPTIONS.map((pal) => {
                      const active = logoConfig.paletteStyle === pal.id;
                      return (
                        <button
                          key={pal.id}
                          type="button"
                          onClick={() =>
                            onLogoConfigChange({
                              ...logoConfig,
                              paletteStyle: pal.id,
                            })
                          }
                          className={`flex items-center gap-2.5 rounded-md border px-2.5 py-1.5 text-left transition-colors cursor-pointer ${
                            active
                              ? "border-[#F03FA8] bg-[#F03FA8]/12"
                              : "border-white/10 bg-[#1B112B] hover:border-white/25"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 rounded border border-white/25"
                            style={{ background: pal.previewGradient }}
                          />
                          <span className="text-xs font-medium text-[#F8F4FF]">
                            {pal.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="gta6-logo-position"
                      className="block text-xs font-medium text-[#C4B5E3]"
                    >
                      Posição do Logo
                    </label>
                    <select
                      id="gta6-logo-position"
                      value={logoConfig.position}
                      onChange={(e) =>
                        onLogoConfigChange({
                          ...logoConfig,
                          position: e.target.value as LogoPosition,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-white/10 bg-[#1B112B] px-2.5 py-2 text-xs font-medium text-[#F8F4FF] focus:border-[#F03FA8] focus:outline-none"
                    >
                      <option value="bottom_center">Capa Central (Grande)</option>
                      <option value="bottom_right">Canto Inferior Direito</option>
                      <option value="bottom_left">Canto Inferior Esquerdo</option>
                      <option value="top_right">Canto Superior Direito</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="gta6-logo-scale"
                        className="text-xs font-medium text-[#C4B5E3]"
                      >
                        Tamanho do Emblema
                      </label>
                      <span className="font-mono text-[11px] text-[#F9A66C] tabular-nums">
                        {Math.round(logoConfig.scale * 100)}%
                      </span>
                    </div>
                    <input
                      id="gta6-logo-scale"
                      type="range"
                      min={0.5}
                      max={1.35}
                      step={0.05}
                      value={logoConfig.scale}
                      onChange={(e) =>
                        onLogoConfigChange({
                          ...logoConfig,
                          scale: Number(e.target.value),
                        })
                      }
                      className="mt-2.5 h-1.5 w-full cursor-pointer accent-[#F03FA8]"
                    />
                  </div>
                </div>
              </div>

              {/* Dedicated Controls for the Stacked "grand theft auto" Band */}
              <div className="rounded-lg border border-[#3CC4B8]/30 bg-[#130B20] p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      data-testid="wordmark-enabled-toggle"
                      checked={logoConfig.showTopWordmark}
                      onChange={(e) =>
                        onLogoConfigChange({
                          ...logoConfig,
                          showTopWordmark: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-[#3CC4B8] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#F8F4FF]">
                      Ajuste da Faixa &quot;grand theft auto&quot;
                    </span>
                  </label>

                  {logoConfig.showTopWordmark && (
                    <button
                      type="button"
                      onClick={resetWordmarkAdjustments}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3CC4B8] hover:text-[#9BF2EA] cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" aria-hidden="true" />
                      <span>Resetar</span>
                    </button>
                  )}
                </div>

                {logoConfig.showTopWordmark && (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="wordmark-scale"
                          className="text-[11px] font-medium text-[#C4B5E3]"
                        >
                          Tamanho da Faixa
                        </label>
                        <span className="font-mono text-[11px] text-[#3CC4B8] tabular-nums">
                          {Math.round(logoConfig.topWordmarkScale * 100)}%
                        </span>
                      </div>
                      <input
                        id="wordmark-scale"
                        data-testid="wordmark-scale-slider"
                        type="range"
                        min={0.6}
                        max={1.45}
                        step={0.05}
                        value={logoConfig.topWordmarkScale}
                        onChange={(e) =>
                          onLogoConfigChange({
                            ...logoConfig,
                            topWordmarkScale: Number(e.target.value),
                          })
                        }
                        className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#3CC4B8]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="wordmark-line-gap"
                          className="text-[11px] font-medium text-[#C4B5E3]"
                        >
                          Espaçamento Linhas
                        </label>
                        <span className="font-mono text-[11px] text-[#3CC4B8] tabular-nums">
                          {Math.round(logoConfig.topWordmarkLineGap * 100)}%
                        </span>
                      </div>
                      <input
                        id="wordmark-line-gap"
                        type="range"
                        min={0.68}
                        max={1.05}
                        step={0.02}
                        value={logoConfig.topWordmarkLineGap}
                        onChange={(e) =>
                          onLogoConfigChange({
                            ...logoConfig,
                            topWordmarkLineGap: Number(e.target.value),
                          })
                        }
                        className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#3CC4B8]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="wordmark-offset-y"
                          className="text-[11px] font-medium text-[#C4B5E3]"
                        >
                          Posição Vertical (Y)
                        </label>
                        <span className="font-mono text-[11px] text-[#3CC4B8] tabular-nums">
                          {logoConfig.topWordmarkOffsetY > 0
                            ? `+${logoConfig.topWordmarkOffsetY}px`
                            : `${logoConfig.topWordmarkOffsetY}px`}
                        </span>
                      </div>
                      <input
                        id="wordmark-offset-y"
                        data-testid="wordmark-offset-y-slider"
                        type="range"
                        min={-80}
                        max={80}
                        step={2}
                        value={logoConfig.topWordmarkOffsetY}
                        onChange={(e) =>
                          onLogoConfigChange({
                            ...logoConfig,
                            topWordmarkOffsetY: Number(e.target.value),
                          })
                        }
                        className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#3CC4B8]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="wordmark-offset-x"
                          className="text-[11px] font-medium text-[#C4B5E3]"
                        >
                          Posição Horizontal (X)
                        </label>
                        <span className="font-mono text-[11px] text-[#3CC4B8] tabular-nums">
                          {logoConfig.topWordmarkOffsetX > 0
                            ? `+${logoConfig.topWordmarkOffsetX}px`
                            : `${logoConfig.topWordmarkOffsetX}px`}
                        </span>
                      </div>
                      <input
                        id="wordmark-offset-x"
                        type="range"
                        min={-80}
                        max={80}
                        step={2}
                        value={logoConfig.topWordmarkOffsetX}
                        onChange={(e) =>
                          onLogoConfigChange({
                            ...logoConfig,
                            topWordmarkOffsetX: Number(e.target.value),
                          })
                        }
                        className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#3CC4B8]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: Sublimation Pre-Press & Real-Time Audit */}
      {activeTab === "prepress" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#C4B5E3]">
              Piso Mínimo de Preto (max_black_hex)
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
                        ? "border-[#F03FA8] bg-[#F03FA8]/12"
                        : "border-white/10 bg-[#130B20] hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-4 w-4 rounded border border-white/20"
                        style={{ backgroundColor: opt.hex }}
                      />
                      <span className="font-mono text-xs font-semibold text-[#F8F4FF]">
                        {opt.label}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-[11px] text-[#B8A8D8]">
                      {opt.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#130B20] px-3 py-2.5 cursor-pointer">
              <div>
                <span className="block text-xs font-semibold text-[#F8F4FF]">
                  Compensação de Ponto Preto
                </span>
                <span className="block text-[11px] text-[#B8A8D8]">
                  Evita #000000 puro elevando sombras para {prepressOptions.blackFloorHex}
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
                className="h-4 w-4 accent-[#F03FA8] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#130B20] px-3 py-2.5 cursor-pointer">
              <div>
                <span className="block text-xs font-semibold text-[#F8F4FF]">
                  Vinheta Esfumaçada para Tecido
                </span>
                <span className="block text-[11px] text-[#B8A8D8]">
                  Bordas suaves 3:4 sem recorte quadrado na camiseta
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
                className="h-4 w-4 accent-[#F03FA8] cursor-pointer"
              />
            </label>
          </div>

          <div className="border-t border-white/10 pt-3">
            <h3 className="font-display text-xs font-semibold tracking-wide text-[#C4B5E3]">
              Auditoria de Pré-Impressão (Tempo Real)
            </h3>
            <dl className="mt-2 divide-y divide-white/8 rounded-lg border border-white/10 bg-[#130B20] text-xs">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <dt className="text-[#B8A8D8]">Pixels &lt; #141416 (Original)</dt>
                <dd
                  data-testid="audit-crushed-percent"
                  className="font-mono font-semibold text-[#F8F4FF] tabular-nums"
                >
                  {audit ? `${audit.crushedBlackPercentOriginal.toFixed(2)}%` : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <dt className="text-[#B8A8D8]">Mínimo Original → Compensado</dt>
                <dd
                  data-testid="audit-min-hex"
                  className="font-mono font-semibold text-[#F9A66C] tabular-nums"
                >
                  {audit
                    ? `${audit.minHexOriginal} → ${audit.minHexCompensated}`
                    : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <dt className="text-[#B8A8D8]">Densidade Estimada de Tinta</dt>
                <dd className="font-mono font-medium text-[#F8F4FF] tabular-nums">
                  {audit ? `${audit.estimatedInkLoadPercent.toFixed(1)}%` : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <dt className="text-[#B8A8D8]">Proporção · Perfil</dt>
                <dd className="font-mono font-medium text-[#3CC4B8] tabular-nums">
                  {audit ? `${audit.aspectRatioLabel} · sRGB` : "3:4 · sRGB"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </aside>
  );
};
