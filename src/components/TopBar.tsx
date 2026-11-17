import React from "react";
import { Upload } from "lucide-react";

interface TopBarProps {
  onTriggerUpload: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onTriggerUpload }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#121316]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#studio"
          className="font-display text-lg font-semibold tracking-tight text-[#F4F4F5] whitespace-nowrap shrink-0"
        >
          Vice Pre-Press
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A1A1AA]"
        >
          <a
            href="#studio"
            className="hover:text-[#F4F4F5] transition-colors whitespace-nowrap shrink-0"
          >
            Estúdio
          </a>
          <a
            href="#prepress"
            className="hover:text-[#F4F4F5] transition-colors whitespace-nowrap shrink-0"
          >
            Pré-Impressão
          </a>
          <a
            href="#json-spec"
            className="hover:text-[#F4F4F5] transition-colors whitespace-nowrap shrink-0"
          >
            JSON Estruturado
          </a>
          <a
            href="#samples"
            className="hover:text-[#F4F4F5] transition-colors whitespace-nowrap shrink-0"
          >
            Amostras
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onTriggerUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D98A3C] px-4 py-2 text-sm font-semibold text-[#141416] hover:bg-[#E39A4F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D98A3C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Enviar Foto</span>
          </button>
        </div>
      </div>
    </header>
  );
};
