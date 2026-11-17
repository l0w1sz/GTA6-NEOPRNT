import React from "react";
import type { StudioPreset } from "../data/presets";

interface SampleGalleryProps {
  presets: StudioPreset[];
  activePresetId: string | null;
  onSelectPreset: (preset: StudioPreset) => void;
}

export const SampleGallery: React.FC<SampleGalleryProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <section
      id="samples"
      aria-label="Amostras de Referência GTA VI Vice City"
      className="mt-10 pb-12"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-[#F4F4F5]">
            Amostras Calibradas GTA VI (Vice City)
          </h2>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Pares de referência validados com preservação facial, iluminação neon
            tropical, vinheta para tecido e piso #1C102A.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {presets.map((preset) => {
          const isCurrent = activePresetId === preset.id;
          return (
            <article
              key={preset.id}
              className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#18191E]"
            >
              <div className="grid grid-cols-2 gap-px bg-white/10">
                <div className="relative aspect-[3/4] bg-[#121316]">
                  <img
                    src={preset.originalImageUrl}
                    alt={`Original — ${preset.title}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 rounded bg-[#141416]/85 px-2 py-0.5 text-[11px] font-medium text-[#E4E4E7]">
                    Original
                  </span>
                </div>
                <div className="relative aspect-[3/4] bg-[#121316]">
                  <img
                    src={preset.generatedImageUrl}
                    alt={`Key Art — ${preset.title}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 rounded bg-[#141416]/85 px-2 py-0.5 text-[11px] font-medium text-[#D98A3C]">
                    Key Art 3:4
                  </span>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 className="font-display text-base font-semibold text-[#F4F4F5]">
                    {preset.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#A1A1AA]">
                    {preset.subtitle}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#D4D4D8]">
                    {preset.spec.subject_preservation.detected_user_features}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`mt-4 w-full rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    isCurrent
                      ? "border-[#D98A3C] bg-[#D98A3C]/15 text-[#D98A3C]"
                      : "border-white/15 bg-[#22242B] text-[#F4F4F5] hover:bg-[#2B2D36]"
                  }`}
                >
                  {isCurrent ? "Ativo na Mesa de Prova" : "Carregar no Estúdio"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
