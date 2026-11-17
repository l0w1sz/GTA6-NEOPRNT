import { useCallback, useRef, useState } from "react";
import { STUDIO_PRESETS, type StudioPreset } from "./data/presets";
import { TopBar } from "./components/TopBar";
import { ProofingCanvas } from "./components/ProofingCanvas";
import { PrepressWorkspace } from "./components/PrepressWorkspace";
import { JsonSpecPanel } from "./components/JsonSpecPanel";
import { SampleGallery } from "./components/SampleGallery";
import type { PrepressAudit, PrepressOptions } from "./utils/prepress";
import {
  buildGtaViSpec,
  DEFAULT_GTA6_TUNING,
  type GtaViArtDirectionTuning,
  type GtaViSublimationSpec,
} from "./utils/specBuilder";

async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  if (url.startsWith("data:")) {
    const [header, data] = url.split(",");
    const mimeMatch = header.match(/data:([^;]+);base64/);
    return {
      base64: data ?? "",
      mimeType: mimeMatch?.[1] ?? "image/jpeg",
    };
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Não foi possível carregar a imagem de entrada para envio.");
  }
  const blob = await response.blob();
  const mimeType = blob.type || "image/jpeg";
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(new Error("Erro ao converter foto para base64."));
    reader.readAsDataURL(blob);
  });
  return { base64, mimeType };
}

export default function App() {
  const initialPreset = STUDIO_PRESETS[0];

  const [activePresetId, setActivePresetId] = useState<string | null>(
    initialPreset.id
  );
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>(
    initialPreset.originalImageUrl
  );
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(
    initialPreset.generatedImageUrl
  );
  const [subjectLabel, setSubjectLabel] = useState<string>(initialPreset.title);
  const [spec, setSpec] = useState<GtaViSublimationSpec>(initialPreset.spec);

  const [tuning, setTuning] = useState<GtaViArtDirectionTuning>(
    initialPreset.recommendedTuning ?? DEFAULT_GTA6_TUNING
  );

  const [prepressOptions, setPrepressOptions] = useState<PrepressOptions>({
    blackFloorHex: initialPreset.recommendedBlackFloor,
    applyBlackCompensation: true,
    applyFeatheredVignette: true,
    vignetteIntensity: 0.72,
    highlightPureBlackRisk: false,
  });

  const [audit, setAudit] = useState<PrepressAudit | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectPreset = useCallback((preset: StudioPreset) => {
    setActivePresetId(preset.id);
    setCustomFileName(null);
    setOriginalImageUrl(preset.originalImageUrl);
    setGeneratedImageUrl(preset.generatedImageUrl);
    setSubjectLabel(preset.title);
    setSpec(preset.spec);
    setTuning(preset.recommendedTuning);
    setPrepressOptions((prev) => ({
      ...prev,
      blackFloorHex: preset.recommendedBlackFloor,
    }));
    setApiError(null);
  }, []);

  const handleTuningChange = useCallback(
    (next: GtaViArtDirectionTuning) => {
      setTuning(next);
      // When browsing built-in studio samples and changing the GTA 6 scene preset,
      // automatically preview the corresponding Vice City reference artwork if available.
      if (!customFileName && next.sceneSetting !== tuning.sceneSetting) {
        const sceneMatch = STUDIO_PRESETS.find(
          (p) => p.recommendedTuning.sceneSetting === next.sceneSetting
        );
        if (sceneMatch) {
          setActivePresetId(sceneMatch.id);
          setOriginalImageUrl(sceneMatch.originalImageUrl);
          setGeneratedImageUrl(sceneMatch.generatedImageUrl);
          setSubjectLabel(sceneMatch.title);
          setSpec(sceneMatch.spec);
        }
      }
    },
    [customFileName, tuning.sceneSetting]
  );

  const handleFileSelected = useCallback((file: File) => {
    setApiError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      if (!dataUrl) return;
      setActivePresetId(null);
      setCustomFileName(file.name);
      setOriginalImageUrl(dataUrl);
      setSubjectLabel(file.name.replace(/\.[^.]+$/, ""));
      setSpec(
        buildGtaViSpec(
          "aguardando análise Gemini para extração automática dos traços da foto"
        )
      );
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerateWithGemini = useCallback(async () => {
    setIsGenerating(true);
    setApiError(null);
    setGenerationStage(
      "Etapa 1/2: Pintura Key Art Vice City (3:4) · Etapa 2/2: JSON Estruturado"
    );

    try {
      const { base64, mimeType } = await urlToBase64(originalImageUrl);

      const response = await fetch("/api/generate-key-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          tuning,
        }),
      });

      const payload = (await response.json()) as {
        generatedImageDataUrl?: string;
        spec?: GtaViSublimationSpec;
        error?: string;
      };

      if (!response.ok || !payload.generatedImageDataUrl || !payload.spec) {
        throw new Error(
          payload.error ||
            "Não foi possível gerar a arte GTA VI a partir da API Gemini."
        );
      }

      setGeneratedImageUrl(payload.generatedImageDataUrl);
      setSpec(payload.spec);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao comunicar com o servidor Gemini."
      );
    } finally {
      setIsGenerating(false);
      setGenerationStage("");
    }
  }, [originalImageUrl, tuning]);

  const handleUpdateDetectedFeatures = useCallback((features: string) => {
    setSpec(buildGtaViSpec(features));
  }, []);

  const handleAuditUpdate = useCallback((nextAudit: PrepressAudit) => {
    setAudit(nextAudit);
  }, []);

  return (
    <div className="min-h-screen bg-[#121316] text-[#F4F4F5]">
      <TopBar onTriggerUpload={() => fileInputRef.current?.click()} />

      <main id="studio" className="mx-auto max-w-[1360px] px-4 sm:px-6 pt-5 pb-14">
        {/* Editorial Studio Header */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-[#D93B58]">
              Direção de Arte GTA VI &amp; Engenharia de Pré-Impressão
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#F4F4F5] sm:text-3xl [text-wrap:balance]">
              Estúdio GTA VI Vice City para Sublimação
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#A1A1AA]">
              Transforme retratos em ilustrações editoriais 3:4 com iluminação
              neon tropical, pôr do sol Art Déco, preservação facial integral e
              compensação de ponto preto em #1C102A para poliéster.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-mono text-xs text-[#D4D4D8] tabular-nums">
              3:4 sRGB · Piso {prepressOptions.blackFloorHex}
            </p>
            <p className="mt-0.5 text-xs text-[#A1A1AA]">
              Pipeline Gemini 2 Etapas · Sem texto ou HUD
            </p>
          </div>
        </div>

        {/* Primary 2-Column Proofing Split */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <ProofingCanvas
              originalImageUrl={originalImageUrl}
              generatedImageUrl={generatedImageUrl}
              subjectLabel={subjectLabel}
              prepressOptions={prepressOptions}
              isGenerating={isGenerating}
              generationStage={generationStage}
              apiError={apiError}
              onDismissError={() => setApiError(null)}
              onAuditUpdate={handleAuditUpdate}
              onGenerateWithGemini={handleGenerateWithGemini}
            />
          </div>

          <div className="min-w-0 lg:col-span-5">
            <PrepressWorkspace
              fileInputRef={fileInputRef}
              presets={STUDIO_PRESETS}
              activePresetId={activePresetId}
              customFileName={customFileName}
              originalPreviewUrl={originalImageUrl}
              onSelectPreset={handleSelectPreset}
              onFileSelected={handleFileSelected}
              tuning={tuning}
              onTuningChange={handleTuningChange}
              prepressOptions={prepressOptions}
              onPrepressChange={setPrepressOptions}
              audit={audit}
            />
          </div>
        </div>

        {/* Standardized JSON Output + Palette Swatches */}
        <JsonSpecPanel
          spec={spec}
          onUpdateDetectedFeatures={handleUpdateDetectedFeatures}
        />

        {/* Sample Gallery */}
        <SampleGallery
          presets={STUDIO_PRESETS}
          activePresetId={activePresetId}
          onSelectPreset={handleSelectPreset}
        />
      </main>
    </div>
  );
}
