import React from "react";
import { Upload } from "lucide-react";

interface TopBarProps {
  onTriggerUpload: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onTriggerUpload }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#130B20]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-4 sm:px-6 py-3.5">
        <a
          href="#studio"
          className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#F8F4FF] whitespace-nowrap shrink-0"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#F7B538]/70 bg-gradient-to-b from-[#4E6CF0] via-[#F03FA8] to-[#F9C56E] text-[11px] font-black text-[#130B20]"
          >
            VI
          </span>
          <span>Vice Pre-Press</span>
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#C4B5E3]"
        >
          <a
            href="#studio"
            className="hover:text-[#F8F4FF] transition-colors whitespace-nowrap shrink-0"
          >
            Estúdio
          </a>
          <a
            href="#prepress"
            className="hover:text-[#F8F4FF] transition-colors whitespace-nowrap shrink-0"
          >
            Controles GTA VI
          </a>
          <a
            href="#json-spec"
            className="hover:text-[#F8F4FF] transition-colors whitespace-nowrap shrink-0"
          >
            JSON Sublimação
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTriggerUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#F03FA8] to-[#F9A66C] px-4 py-2 text-sm font-bold text-[#130B20] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F03FA8] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Enviar Foto</span>
          </button>
        </div>
      </div>
    </header>
  );
};
