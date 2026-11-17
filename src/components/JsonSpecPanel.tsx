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
      className="mt-10 rounded-xl border border-white/10 bg-[#18191E] p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F4F4F5]">
            Especificação JSON Estruturada para Pré-Impressão
          </h2>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Bloco imutável de direção de arte GTA VI Vice City e requisitos de
            sublimação pronto para envio à gráfica.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#22242B] px-3.5 py-2 text-xs font-semibold text-[#F4F4F5] hover:bg-[#2B2D36] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#F28C38]" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{copied ? "JSON Copiado" : "Copiar JSON"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D98A3C] px-3.5 py-2 text-xs font-semibold text-[#141416] hover:bg-[#E39A4F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Baixar spec.json</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: Palette Swatches + Editable Detected Features */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-[#A1A1AA]">
              Paleta Oficial Vice City (GTA VI)
            </h3>
            <div className="mt-3 divide-y divide-white/8 rounded-lg border border-white/10 bg-[#121316]">
              {GTA6_SWATCHES.map((swatch) => (
                <div
                  key={swatch.hex}
                  className="flex items-center justify-between px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 rounded border border-white/15"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-xs font-medium text-[#F4F4F5]">
                      {swatch.role}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#D4D4D8] tabular-nums">
                    {swatch.hex}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="detected-features-input"
              className="block text-xs font-semibold tracking-wide text-[#A1A1AA]"
            >
              Campo Variável: detected_user_features
            </label>
            <textarea
              id="detected-features-input"
              rows={3}
              value={spec.subject_preservation.detected_user_features}
              onChange={(e) => onUpdateDetectedFeatures(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#121316] p-3 font-mono text-xs leading-relaxed text-[#F4F4F5] focus:border-[#D93B58] focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-[#A1A1AA]">
              Preenchido automaticamente pelo Gemini a partir da foto original e
              ajustável para o operador de pré-impressão.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#121316] px-4 py-3 text-xs text-[#D4D4D8]">
            <span className="font-semibold text-[#F4F4F5]">
              Validação de Schema:
            </span>{" "}
            {validation.valid
              ? "100% conforme o contrato de produção GTA_VI_VICE_CITY."
              : validation.errors.join(" ")}
          </div>
        </div>

        {/* Right column: Exact JSON Output */}
        <div className="min-w-0 lg:col-span-7">
          <pre
            data-testid="json-spec-output"
            className="h-full max-w-full overflow-x-auto rounded-lg border border-white/10 bg-[#121316] p-4 font-mono text-xs leading-6 text-[#E4E4E7]"
          >
            <code>{formattedJson}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
