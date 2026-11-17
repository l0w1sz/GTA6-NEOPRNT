import React, { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import {
  GTA6_SWATCHES,
  validateGtaViSpec,
  type GtaViSublimationSpec,
} from "../utils/specBuilder";

interface JsonSpecPanelProps {
  spec: GtaViSublimationSpec;
  onUpdateDetectedFeatures: (features: string) => void;
}

export const JsonSpecPanel: React.FC<JsonSpecPanelProps> = ({
  spec,
  onUpdateDetectedFeatures,
}) => {
  const [copied, setCopied] = useState(false);

  const formattedJson = JSON.stringify(spec, null, 2);
  const validation = validateGtaViSpec(spec);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = formattedJson;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gta-vi-vice-city-sublimation-spec.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="json-spec"
      aria-label="Especificação JSON Padronizada para Sublimação"
      className="mt-8 rounded-xl border border-[#4E6CF0]/20 bg-[#1B112B] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#F8F4FF]">
            Especificação JSON para Sublimação (GTA VI)
          </h2>
          <p className="mt-0.5 text-xs text-[#C4B5E3]">
            Parâmetros imutáveis Vice City + metadados do logo sincronizados em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#130B20] px-3.5 py-2 text-xs font-semibold text-[#F8F4FF] hover:border-[#F03FA8]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#3CC4B8]" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{copied ? "Copiado" : "Copiar JSON"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#F03FA8] to-[#F9A66C] px-3.5 py-2 text-xs font-bold text-[#130B20] hover:brightness-110 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Baixar spec.json</span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left column: GTA VI Palette Swatches + Detected Features */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-[#C4B5E3]">
              Paleta Base GTA VI (Referências Oficiais)
            </h3>
            <div className="mt-2.5 divide-y divide-white/8 rounded-lg border border-white/10 bg-[#130B20]">
              {GTA6_SWATCHES.map((swatch) => (
                <div
                  key={swatch.hex}
                  className="flex items-center justify-between px-3.5 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 rounded border border-white/20"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-xs font-medium text-[#F8F4FF]">
                      {swatch.role}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#C4B5E3] tabular-nums">
                    {swatch.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="detected-features-input"
              className="block text-xs font-semibold tracking-wide text-[#C4B5E3]"
            >
              Traços Detectados (detected_user_features)
            </label>
            <textarea
              id="detected-features-input"
              rows={3}
              value={spec.subject_preservation.detected_user_features}
              onChange={(e) => onUpdateDetectedFeatures(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#130B20] p-3 font-mono text-xs leading-relaxed text-[#F8F4FF] focus:border-[#F03FA8] focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-[#3CC4B8]/25 bg-[#130B20] px-3.5 py-2.5 text-xs text-[#E4DAF5]">
            <span className="font-semibold text-[#3CC4B8]">Schema:</span>{" "}
            {validation.valid
              ? "Válido (GTA_VI_VICE_CITY · 3:4 sRGB)."
              : validation.errors.join(" ")}
          </div>
        </div>

        {/* Right column: Exact JSON Output */}
        <div className="min-w-0 lg:col-span-7">
          <pre
            data-testid="json-spec-output"
            className="h-full max-w-full overflow-x-auto rounded-lg border border-white/10 bg-[#130B20] p-4 font-mono text-xs leading-6 text-[#E4DAF5]"
          >
            <code>{formattedJson}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
