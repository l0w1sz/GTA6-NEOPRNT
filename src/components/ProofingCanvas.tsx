import React, { useEffect, useRef, useState } from "react";
import { Download, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import {
  applySublimationPrepress,
  calculateCropTo3x4,
  type PrepressAudit,
  type PrepressOptions,
} from "../utils/prepress";

export type CanvasViewMode = "compare" | "artwork" | "risk" | "tshirt";

interface ProofingCanvasProps {
  originalImageUrl: string;
  generatedImageUrl: string;
  subjectLabel: string;
  prepressOptions: PrepressOptions;
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
  isGenerating,
  generationStage,
  apiError,
  onDismissError,
  onAuditUpdate,
  onGenerateWithGemini,
}) => {
  const shortFranchiseLabel = "GTA VI";
  const [viewMode, setViewMode] = useState<CanvasViewMode>("compare");
  const [splitPercent, setSplitPercent] = useState<number>(58);
  const [fabricTone, setFabricTone] = useState<"light" | "charcoal">("light");
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedGenImgRef = useRef<HTMLImageElement | null>(null);

  // Process the generated artwork on an offscreen/display canvas with true black-point compensation
  useEffect(() => {
    let cancelled = false;
    setImageLoadError(false);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      loadedGenImgRef.current = img;

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
        // Also prepare clean production data URL for download even while viewing risk map
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

    img.onerror = () => {
      if (!cancelled) {
        setImageLoadError(true);
      }
    };

    img.src = generatedImageUrl;

    return () => {
      cancelled = true;
    };
  }, [generatedImageUrl, prepressOptions, viewMode, onAuditUpdate]);

  const handleDownloadPng = () => {
    if (!processedDataUrl) return;
    const link = document.createElement("a");
    link.href = processedDataUrl;
    link.download = `vice-city-gta6-sublimation-3x4-${prepressOptions.blackFloorHex.replace("#", "")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      aria-label="Mesa de Prova 3:4 e Comparação"
      className="flex flex-col rounded-xl border border-white/10 bg-[#18191E] p-5"
    >
      {/* Top Toolbar: View Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-[#F4F4F5]">
            Prova de Arte 3:4
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            {subjectLabel} · sRGB · Comp. Ponto Preto{" "}
            {prepressOptions.applyBlackCompensation
              ? prepressOptions.blackFloorHex
              : "Desativada"}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Modo de visualização da prova"
          className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-white/10 bg-[#121316] p-1"
        >
          {(
            [
              { id: "compare", label: "Comparação" },
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
                    ? "bg-[#262830] text-[#F4F4F5]"
                    : "text-[#A1A1AA] hover:text-[#F4F4F5]"
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
          className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-[#E85D2A]/40 bg-[#E85D2A]/10 px-4 py-3 text-sm text-[#F4F4F5]"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#E85D2A]"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-[#F4F4F5]">
                Falha na etapa de geração Gemini
              </p>
              <p className="mt-0.5 text-xs text-[#D4D4D8]">{apiError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4F5] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main 3:4 Proofing Viewport */}
      <div className="relative mx-auto w-full max-w-[395px]">
        <div
          data-testid="proofing-viewport"
          className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-white/10 bg-[#121316]"
        >
          {/* Processed 3:4 Canvas (always rendered underneath or directly visible) */}
          <canvas
            ref={canvasRef}
            data-testid="prepress-canvas"
            aria-label="Arte final GTA IV processada para sublimação 3:4"
            className={`h-full w-full object-cover ${
              viewMode === "tshirt" ? "hidden" : "block"
            }`}
          />

          {/* CSS Fallback if image failed to load */}
          {imageLoadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1C1D21] p-6 text-center">
              <p className="font-display text-sm font-semibold text-[#F4F4F5]">
                Imagem indisponível para renderização
              </p>
              <p className="mt-1 text-xs text-[#A1A1AA]">
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

              {/* Split Line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 w-px bg-[#D98A3C]"
                style={{ left: `${splitPercent}%` }}
              >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded border border-[#D98A3C] bg-[#141416]/90 px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#F4F4F5]">
                  {splitPercent}%
                </div>
              </div>

              {/* Subtle Corner Labels */}
              <span className="pointer-events-none absolute left-3 top-3 rounded bg-[#141416]/80 px-2 py-1 text-[11px] font-medium text-[#E4E4E7]">
                Foto Original
              </span>
              <span className="pointer-events-none absolute right-3 top-3 rounded bg-[#141416]/80 px-2 py-1 text-[11px] font-medium text-[#D98A3C]">
                {shortFranchiseLabel} · 3:4
              </span>
            </>
          )}

          {/* Diagnostic Risk Legend */}
          {viewMode === "risk" && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-md border border-white/10 bg-[#141416]/90 px-3 py-2 text-xs text-[#E4E4E7]">
              Zonas em laranja-avermelhado indicam pixels originais abaixo de{" "}
              <span className="font-mono text-[#D98A3C]">#141416</span> que
              foram elevados pela compensação de ponto preto.
            </div>
          )}

          {/* T-Shirt Sublimation Placement Mockup */}
          {viewMode === "tshirt" && (
            <div
              className={`flex h-full w-full flex-col items-center justify-between p-5 transition-colors ${
                fabricTone === "light" ? "bg-[#DCDCD7]" : "bg-[#1C1E23]"
              }`}
            >
              <div className="relative flex w-full max-w-[290px] flex-1 items-center justify-center">
                {/* Refined garment silhouette */}
                <svg
                  viewBox="0 0 320 380"
                  className="h-auto w-full drop-shadow-md"
                  aria-label="Simulação de aplicação da estampa em camiseta de poliéster"
                >
                  <path
                    d="M84 22 L124 10 Q160 32 196 10 L236 22 L302 74 L274 134 L240 116 L240 368 L80 368 L80 116 L46 134 L18 74 Z"
                    fill={fabricTone === "light" ? "#F5F5F2" : "#2B2D34"}
                    stroke={fabricTone === "light" ? "#C8C8C2" : "#3C3F49"}
                    strokeWidth="2"
                  />
                  <path
                    d="M124 10 Q160 38 196 10"
                    fill="none"
                    stroke={fabricTone === "light" ? "#C8C8C2" : "#3C3F49"}
                    strokeWidth="2"
                  />
                  <path
                    d="M84 22 L80 116 M236 22 L240 116"
                    fill="none"
                    stroke={fabricTone === "light" ? "#E2E2DC" : "#343740"}
                    strokeWidth="1.2"
                  />
                </svg>

                {/* Sublimation Print Chest Placement with Feathered Fabric Edges */}
                <div
                  className="absolute top-[22%] w-[44%] overflow-hidden"
                  style={
                    prepressOptions.applyFeatheredVignette
                      ? {
                          WebkitMaskImage:
                            "radial-gradient(ellipse 84% 86% at 50% 48%, black 60%, transparent 98%)",
                          maskImage:
                            "radial-gradient(ellipse 84% 86% at 50% 48%, black 60%, transparent 98%)",
                        }
                      : undefined
                  }
                >
                  {processedDataUrl ? (
                    <img
                      src={processedDataUrl}
                      alt="Estampa sublimada posicionada no tórax da camiseta"
                      referrerPolicy="no-referrer"
                      className="aspect-[3/4] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-[#1C1D21]" />
                  )}
                </div>
              </div>

              {/* Fabric selector */}
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFabricTone("light")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    fabricTone === "light"
                      ? "bg-[#141416] text-[#F4F4F5]"
                      : "bg-black/25 text-[#E4E4E7] hover:bg-black/40"
                  }`}
                >
                  Poliéster Branco
                </button>
                <button
                  type="button"
                  onClick={() => setFabricTone("charcoal")}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    fabricTone === "charcoal"
                      ? "bg-[#D98A3C] text-[#141416]"
                      : "bg-black/20 text-[#27272A] hover:bg-black/30"
                  }`}
                >
                  Poliéster Mescla Escuro
                </button>
              </div>
            </div>
          )}

          {/* Generation Loading Overlay */}
          {isGenerating && (
            <div
              role="status"
              aria-live="polite"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#121316]/85 p-6 text-center backdrop-blur-xs"
            >
              <RefreshCw
                className="h-7 w-7 animate-spin text-[#D98A3C]"
                aria-hidden="true"
              />
              <p className="mt-4 font-display text-base font-semibold text-[#F4F4F5]">
                Processando Direção de Arte
              </p>
              <p className="mt-1 text-xs text-[#D4D4D8]">{generationStage}</p>
            </div>
          )}
        </div>

        {/* Accessible Split Comparison Slider */}
        {viewMode === "compare" && (
          <div className="mt-3 flex items-center gap-3">
            <label
              htmlFor="split-range"
              className="text-xs font-medium text-[#A1A1AA] whitespace-nowrap shrink-0"
            >
              Divisor Antes / Depois
            </label>
            <input
              id="split-range"
              type="range"
              min={0}
              max={100}
              value={splitPercent}
              onChange={(e) => setSplitPercent(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-[#D98A3C]"
            />
            <span className="w-10 text-right font-mono text-xs text-[#D4D4D8] tabular-nums">
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
          className="inline-flex items-center gap-2 rounded-lg bg-[#D98A3C] px-4 py-2.5 text-sm font-semibold text-[#141416] hover:bg-[#E39A4F] disabled:cursor-not-allowed disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>
            {isGenerating
              ? "Gerando Arte..."
              : `Gerar Arte ${shortFranchiseLabel} + JSON`}
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!processedDataUrl || isGenerating}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#22242B] px-4 py-2.5 text-sm font-medium text-[#F4F4F5] hover:bg-[#2B2D36] disabled:cursor-not-allowed disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Baixar PNG 3:4 (sRGB)</span>
        </button>
      </div>
    </section>
  );
};
