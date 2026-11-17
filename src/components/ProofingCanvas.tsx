import React, { useEffect, useRef, useState } from "react";
import { Download, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import {
  applySublimationPrepress,
  calculateCropTo3x4,
  type PrepressAudit,
  type PrepressOptions,
} from "../utils/prepress";
import type { GtaViLogoConfig } from "../utils/logoLayout";
import { drawGtaViLogoOnCanvas } from "../utils/logoCanvas";
import { TshirtMockup } from "./TshirtMockup";

export type CanvasViewMode = "compare" | "artwork" | "risk" | "tshirt";

interface ProofingCanvasProps {
  originalImageUrl: string;
  generatedImageUrl: string;
  subjectLabel: string;
  prepressOptions: PrepressOptions;
  logoConfig: GtaViLogoConfig;
  isGenerating: boolean;
  generationStage: string;
  apiError: string | null;
  onDismissError: () => void;
  onAuditUpdate: (audit: PrepressAudit) => void;
  onGenerateWithGemini: () => void;
}

export const ProofingCanvas: React.FC<ProofingCanvasProps> = ({
  originalImageUrl,
  generatedImageUrl,
  subjectLabel,
  prepressOptions,
  logoConfig,
  isGenerating,
  generationStage,
  apiError,
  onDismissError,
  onAuditUpdate,
  onGenerateWithGemini,
}) => {
  const [viewMode, setViewMode] = useState<CanvasViewMode>("compare");
  const [splitPercent, setSplitPercent] = useState<number>(58);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Process the generated artwork on canvas with GTA VI logo overlay & #1C102A black-point compensation
  useEffect(() => {
    let cancelled = false;
    setImageLoadError(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const renderFrame = async () => {
        if (typeof document !== "undefined" && "fonts" in document) {
          try {
            await Promise.all([
              document.fonts.load('900 180px "Montserrat"'),
              document.fonts.load('400 48px "Anton"'),
              document.fonts.load('700 24px "Archivo"'),
            ]);
            await document.fonts.ready;
          } catch {
            // Fallback to system fonts if offline
          }
        }
        if (cancelled) return;

        const targetWidth = 675;
        const targetHeight = 900; // Strict 3:4 proof resolution
        const canvas = canvasRef.current ?? document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const crop = calculateCropTo3x4(img.naturalWidth, img.naturalHeight);
        ctx.drawImage(
          img,
          crop.sx,
          crop.sy,
          crop.sw,
          crop.sh,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Draw GTA VI emblem + adjustable "grand theft auto" band before black-point clamping
        drawGtaViLogoOnCanvas(ctx, targetWidth, targetHeight, logoConfig);

        const frame = ctx.getImageData(0, 0, targetWidth, targetHeight);
        const { output, audit } = applySublimationPrepress(
          frame.data,
          targetWidth,
          targetHeight,
          {
            ...prepressOptions,
            highlightPureBlackRisk: viewMode === "risk",
          }
        );

        const processed = new ImageData(
          new Uint8ClampedArray(output),
          targetWidth,
          targetHeight
        );
        ctx.putImageData(processed, 0, 0);

        onAuditUpdate(audit);

        if (viewMode !== "risk") {
          setProcessedDataUrl(canvas.toDataURL("image/png"));
        } else {
          const cleanResult = applySublimationPrepress(
            frame.data,
            targetWidth,
            targetHeight,
            {
              ...prepressOptions,
              highlightPureBlackRisk: false,
            }
          );
          const exportCanvas = document.createElement("canvas");
          exportCanvas.width = targetWidth;
          exportCanvas.height = targetHeight;
          const exportCtx = exportCanvas.getContext("2d");
          if (exportCtx) {
            exportCtx.putImageData(
              new ImageData(
                new Uint8ClampedArray(cleanResult.output),
                targetWidth,
                targetHeight
              ),
              0,
              0
            );
            setProcessedDataUrl(exportCanvas.toDataURL("image/png"));
          }
        }
      };

      void renderFrame();
    };

    img.onerror = () => {
      if (!cancelled) {
        setImageLoadError(true);
      }
    };

    img.src = generatedImageUrl;

    return () => {
      cancelled = true;
    };
  }, [generatedImageUrl, prepressOptions, logoConfig, viewMode, onAuditUpdate]);

  const handleDownloadPng = () => {
    if (!processedDataUrl) return;
    const link = document.createElement("a");
    link.href = processedDataUrl;
    link.download = `vice-city-gta6-3x4-${prepressOptions.blackFloorHex.replace("#", "")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      aria-label="Mesa de Prova 3:4 e Comparação"
      className="flex flex-col rounded-xl border border-[#4E6CF0]/20 bg-[#1B112B] p-4 sm:p-5"
    >
      {/* Top Toolbar: View Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-[#F8F4FF]">
            Prova de Arte 3:4
          </h2>
          <p className="text-xs text-[#C4B5E3]">
            {subjectLabel} · Piso{" "}
            {prepressOptions.applyBlackCompensation
              ? prepressOptions.blackFloorHex
              : "Sem compensação"}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Modo de visualização da prova"
          className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-white/10 bg-[#130B20] p-1"
        >
          {(
            [
              { id: "compare", label: "Antes / Depois" },
              { id: "artwork", label: "Arte 3:4" },
              { id: "risk", label: "Mapa #000000" },
              { id: "tshirt", label: "Camiseta" },
            ] as const
          ).map((tab) => {
            const active = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setViewMode(tab.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? "bg-[#2C1B47] text-[#F8F4FF] ring-1 ring-[#F03FA8]/45"
                    : "text-[#B8A8D8] hover:text-[#F8F4FF]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* API Error Notice */}
      {apiError && (
        <div
          role="alert"
          className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-[#F03FA8]/40 bg-[#F03FA8]/10 px-4 py-3 text-sm text-[#F8F4FF]"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#F9A66C]"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-[#F8F4FF]">
                Falha na etapa de geração Gemini
              </p>
              <p className="mt-0.5 text-xs text-[#E4DAF5]">{apiError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="text-xs font-medium text-[#C4B5E3] hover:text-[#F8F4FF] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main 3:4 Proofing Viewport */}
      <div className="relative mx-auto w-full max-w-[400px]">
        <div
          data-testid="proofing-viewport"
          className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-[#4E6CF0]/25 bg-[#130B20]"
        >
          <canvas
            ref={canvasRef}
            data-testid="prepress-canvas"
            aria-label="Arte final GTA VI processada para sublimação 3:4"
            className={`h-full w-full object-cover ${
              viewMode === "tshirt" ? "hidden" : "block"
            }`}
          />

          {imageLoadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1C102A] p-6 text-center">
              <p className="font-display text-sm font-semibold text-[#F8F4FF]">
                Imagem indisponível para renderização
              </p>
              <p className="mt-1 text-xs text-[#C4B5E3]">
                Selecione outra foto ou gere novamente a ilustração 3:4.
              </p>
            </div>
          )}

          {/* Before/After Split Overlay */}
          {viewMode === "compare" && !imageLoadError && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - splitPercent}% 0 0)`,
                }}
              >
                <img
                  src={originalImageUrl}
                  alt={`Foto original de ${subjectLabel}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 w-px bg-[#F03FA8]"
                style={{ left: `${splitPercent}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded border border-[#F03FA8] bg-[#1C102A]/95 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#F8F4FF]">
                  {splitPercent}%
                </div>
              </div>

              <span className="pointer-events-none absolute left-3 top-3 rounded bg-[#130B20]/85 px-2 py-1 text-[11px] font-medium text-[#E4DAF5]">
                Original
              </span>
              <span className="pointer-events-none absolute right-3 top-3 rounded bg-[#130B20]/85 px-2 py-1 text-[11px] font-semibold text-[#F9A66C]">
                GTA VI · 3:4
              </span>
            </>
          )}

          {/* Diagnostic Risk Legend */}
          {viewMode === "risk" && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-md border border-white/10 bg-[#130B20]/90 px-3 py-2 text-xs text-[#E4DAF5]">
              Áreas em destaque mostram pixels originais abaixo de{" "}
              <span className="font-mono text-[#F9A66C]">#141416</span> elevados
              para o piso seguro.
            </div>
          )}

          {/* T-Shirt Sublimation Placement Mockup */}
          {viewMode === "tshirt" && (
            <TshirtMockup
              processedDataUrl={processedDataUrl}
              applyFeatheredVignette={prepressOptions.applyFeatheredVignette}
            />
          )}

          {/* Generation Loading Overlay */}
          {isGenerating && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#130B20]/85 p-6 text-center backdrop-blur-xs"
            >
              <RefreshCw
                className="h-7 w-7 animate-spin text-[#F03FA8]"
                aria-hidden="true"
              />
              <p className="mt-4 font-display text-base font-semibold text-[#F8F4FF]">
                Pintando Arte GTA VI
              </p>
              <p className="mt-1 text-xs text-[#C4B5E3]">{generationStage}</p>
            </div>
          )}
        </div>

        {/* Accessible Split Comparison Slider */}
        {viewMode === "compare" && (
          <div className="mt-3 flex items-center gap-3">
            <label
              htmlFor="split-range"
              className="text-xs font-medium text-[#C4B5E3] whitespace-nowrap shrink-0"
            >
              Divisor
            </label>
            <input
              id="split-range"
              type="range"
              min={0}
              max={100}
              value={splitPercent}
              onChange={(e) => setSplitPercent(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#F03FA8]"
            />
            <span className="w-10 text-right font-mono text-xs text-[#E4DAF5] tabular-nums">
              {splitPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Primary Action Strip */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onGenerateWithGemini}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#F03FA8] via-[#E85A8B] to-[#F9A66C] px-4 py-2.5 text-sm font-bold text-[#130B20] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>
            {isGenerating ? "Gerando Arte..." : "Gerar Arte GTA VI + JSON"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!processedDataUrl || isGenerating}
          className="inline-flex items-center gap-2 rounded-lg border border-[#3CC4B8]/35 bg-[#130B20] px-4 py-2.5 text-sm font-medium text-[#F8F4FF] hover:border-[#3CC4B8]/70 hover:bg-[#221538] disabled:cursor-not-allowed disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-4 w-4 text-[#3CC4B8]" aria-hidden="true" />
          <span>Baixar PNG 3:4</span>
        </button>
      </div>
    </section>
  );
};
