import React, { useState } from "react";

export type ShirtColorId =
  | "white"
  | "sand"
  | "pastel_pink"
  | "plum"
  | "charcoal";

export type PrintSizePreset = "a4" | "a3" | "oversized";

interface ShirtColorway {
  id: ShirtColorId;
  label: string;
  shortLabel: string;
  swatch: string;
  bodyBase: string;
  bodyHighlight: string;
  bodyShadow: string;
  collarInner: string;
  stitchStroke: string;
  isLightFabric: boolean;
}

const SHIRT_COLORWAYS: readonly ShirtColorway[] = [
  {
    id: "white",
    label: "Poliéster Branco",
    shortLabel: "Branco",
    swatch: "#F7F5FA",
    bodyBase: "#F4F1F8",
    bodyHighlight: "#FFFFFF",
    bodyShadow: "#DDD5E8",
    collarInner: "#CFC5DC",
    stitchStroke: "#D5CCE1",
    isLightFabric: true,
  },
  {
    id: "sand",
    label: "Off-White Areia",
    shortLabel: "Areia",
    swatch: "#EFE2D0",
    bodyBase: "#EFE2D0",
    bodyHighlight: "#F9F0E3",
    bodyShadow: "#D7C5AD",
    collarInner: "#C5B095",
    stitchStroke: "#C9B69C",
    isLightFabric: true,
  },
  {
    id: "pastel_pink",
    label: "Flamingo Pastel",
    shortLabel: "Flamingo",
    swatch: "#F3CFE0",
    bodyBase: "#F1C8DB",
    bodyHighlight: "#FCE3EF",
    bodyShadow: "#D6A3BC",
    collarInner: "#BF88A3",
    stitchStroke: "#C994AE",
    isLightFabric: true,
  },
  {
    id: "plum",
    label: "Ameixa Vice",
    shortLabel: "Ameixa",
    swatch: "#2B1945",
    bodyBase: "#2B1945",
    bodyHighlight: "#3B245C",
    bodyShadow: "#1A0E2C",
    collarInner: "#12091F",
    stitchStroke: "#4C3372",
    isLightFabric: false,
  },
  {
    id: "charcoal",
    label: "Grafite Escuro",
    shortLabel: "Grafite",
    swatch: "#222029",
    bodyBase: "#222029",
    bodyHighlight: "#312E3B",
    bodyShadow: "#15131A",
    collarInner: "#0E0D12",
    stitchStroke: "#3C3847",
    isLightFabric: false,
  },
];

const PRINT_SIZE_MAP: Record<
  PrintSizePreset,
  { label: string; widthClass: string; topClass: string }
> = {
  a4: { label: "A4", widthClass: "w-[36%]", topClass: "top-[24%]" },
  a3: { label: "A3", widthClass: "w-[44%]", topClass: "top-[21%]" },
  oversized: {
    label: "Oversized",
    widthClass: "w-[51%]",
    topClass: "top-[19%]",
  },
};

interface TshirtMockupProps {
  processedDataUrl: string;
  applyFeatheredVignette: boolean;
}

export const TshirtMockup: React.FC<TshirtMockupProps> = ({
  processedDataUrl,
  applyFeatheredVignette,
}) => {
  const [colorId, setColorId] = useState<ShirtColorId>("white");
  const [printSize, setPrintSize] = useState<PrintSizePreset>("a3");

  const shirt =
    SHIRT_COLORWAYS.find((c) => c.id === colorId) ?? SHIRT_COLORWAYS[0];
  const sizePreset = PRINT_SIZE_MAP[printSize];

  return (
    <div
      data-testid="tshirt-mockup-stage"
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-3.5"
      style={{
        background:
          "radial-gradient(circle at 50% 38%, rgba(78, 108, 240, 0.22) 0%, rgba(240, 63, 168, 0.1) 42%, #130B20 88%)",
      }}
    >
      {/* Top Mockup Controls Strip: Print Scale */}
      <div className="z-10 flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[10px] font-semibold tracking-wider text-[#C4B5E3] uppercase">
          {shirt.label}
        </span>

        <div className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-[#130B20]/80 p-0.5 backdrop-blur-xs">
          {(["a4", "a3", "oversized"] as const).map((key) => {
            const active = printSize === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPrintSize(key)}
                className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-[#F03FA8] text-[#130B20]"
                    : "text-[#C4B5E3] hover:text-[#F8F4FF]"
                }`}
              >
                {PRINT_SIZE_MAP[key].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Realistic Layered Garment Canvas */}
      <div className="relative mx-auto flex w-full max-w-[330px] flex-1 items-center justify-center my-1">
        {/* Soft studio drop shadow behind the shirt */}
        <svg
          viewBox="0 0 400 460"
          className="h-auto w-full select-none"
          aria-label={`Simulação realista da estampa em camiseta ${shirt.label}`}
        >
          <defs>
            {/* Torso 3D cylindrical volume gradient */}
            <linearGradient
              id="shirt-volume-grad"
              x1="0%"
              y1="15%"
              x2="100%"
              y2="85%"
            >
              <stop offset="0%" stopColor={shirt.bodyShadow} />
              <stop offset="22%" stopColor={shirt.bodyBase} />
              <stop offset="48%" stopColor={shirt.bodyHighlight} />
              <stop offset="76%" stopColor={shirt.bodyBase} />
              <stop offset="100%" stopColor={shirt.bodyShadow} />
            </linearGradient>

            {/* Left & Right sleeve shading */}
            <linearGradient
              id="sleeve-left-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={shirt.bodyHighlight} />
              <stop offset="65%" stopColor={shirt.bodyBase} />
              <stop offset="100%" stopColor={shirt.bodyShadow} />
            </linearGradient>
            <linearGradient
              id="sleeve-right-grad"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={shirt.bodyShadow} />
              <stop offset="45%" stopColor={shirt.bodyBase} />
              <stop offset="100%" stopColor={shirt.bodyShadow} />
            </linearGradient>

            {/* Inner neck cavity shadow */}
            <linearGradient
              id="collar-depth-grad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={shirt.bodyShadow} />
              <stop offset="55%" stopColor={shirt.collarInner} />
              <stop offset="100%" stopColor={shirt.bodyBase} />
            </linearGradient>

            {/* Subtle chest & hem fabric crease gradients */}
            <linearGradient id="fold-shadow-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000000" stopOpacity="0" />
              <stop offset="50%" stopColor="#130B20" stopOpacity="0.09" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            <filter
              id="garment-drop-shadow"
              x="-12%"
              y="-8%"
              width="124%"
              height="120%"
            >
              <feDropShadow
                dx="0"
                dy="14"
                stdDeviation="12"
                floodColor="#090412"
                floodOpacity="0.65"
              />
            </filter>
          </defs>

          <g filter="url(#garment-drop-shadow)">
            {/* Back-neck interior cavity */}
            <path
              d="M150 30 Q200 58 250 30 L242 54 Q200 78 158 54 Z"
              fill="url(#collar-depth-grad)"
            />

            {/* Woven Vice City neck label */}
            <rect
              x="185"
              y="43"
              width="30"
              height="11"
              rx="1.5"
              fill="#1C102A"
              opacity="0.92"
            />
            <text
              x="200"
              y="51"
              textAnchor="middle"
              fill="#F9A66C"
              fontSize="6.5"
              fontWeight="800"
              fontFamily="Archivo, sans-serif"
              letterSpacing="0.8"
            >
              VICE VI
            </text>

            {/* Left Sleeve */}
            <path
              d="M112 46 L52 72 Q35 80 26 108 L14 176 Q14 182 22 184 L82 194 Q89 195 92 186 L104 134 Z"
              fill="url(#sleeve-left-grad)"
              stroke={shirt.stitchStroke}
              strokeWidth="1.2"
            />

            {/* Right Sleeve */}
            <path
              d="M288 46 L348 72 Q365 80 374 108 L386 176 Q386 182 378 184 L318 194 Q311 195 308 186 L296 134 Z"
              fill="url(#sleeve-right-grad)"
              stroke={shirt.stitchStroke}
              strokeWidth="1.2"
            />

            {/* Main Tailored Torso Body */}
            <path
              d="M150 30 Q200 66 250 30 L288 46 Q298 112 308 148 Q304 260 308 424 Q308 432 298 434 Q200 442 102 434 Q92 432 92 424 Q96 260 92 148 Q102 112 112 46 Z"
              fill="url(#shirt-volume-grad)"
              stroke={shirt.stitchStroke}
              strokeWidth="1.3"
            />

            {/* Ribbed Crew-Neck Collar */}
            <path
              d="M144 33 Q200 76 256 33 L250 28 Q200 66 150 28 Z"
              fill={shirt.bodyBase}
              stroke={shirt.stitchStroke}
              strokeWidth="1.3"
            />
            <path
              d="M142 36 Q200 81 258 36"
              fill="none"
              stroke={shirt.stitchStroke}
              strokeWidth="0.9"
              strokeDasharray="2 2"
              opacity="0.75"
            />

            {/* Armhole Seams & Shoulder Stitching */}
            <path
              d="M112 46 Q104 108 92 148"
              fill="none"
              stroke={shirt.stitchStroke}
              strokeWidth="1.2"
              opacity="0.85"
            />
            <path
              d="M288 46 Q296 108 308 148"
              fill="none"
              stroke={shirt.stitchStroke}
              strokeWidth="1.2"
              opacity="0.85"
            />

            {/* Sleeve Cuff Double-Needle Hem Stitching */}
            <path
              d="M17 167 L84 179"
              fill="none"
              stroke={shirt.stitchStroke}
              strokeWidth="0.9"
              strokeDasharray="2.5 2"
              opacity="0.75"
            />
            <path
              d="M383 167 L316 179"
              fill="none"
              stroke={shirt.stitchStroke}
              strokeWidth="0.9"
              strokeDasharray="2.5 2"
              opacity="0.75"
            />

            {/* Bottom Hem Double-Needle Stitching */}
            <path
              d="M94 418 Q200 426 306 418"
              fill="none"
              stroke={shirt.stitchStroke}
              strokeWidth="0.9"
              strokeDasharray="2.5 2"
              opacity="0.75"
            />

            {/* Subtle Organic Drape Folds on Lower Torso & Underarms */}
            <path
              d="M100 152 Q128 175 118 228"
              fill="none"
              stroke={shirt.bodyShadow}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.32"
            />
            <path
              d="M300 152 Q272 175 282 228"
              fill="none"
              stroke={shirt.bodyShadow}
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M138 355 Q152 395 144 432"
              fill="none"
              stroke="url(#fold-shadow-grad)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M254 345 Q244 390 252 432"
              fill="none"
              stroke="url(#fold-shadow-grad)"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* Sublimation Chest Print with Fabric Blend & Crease Overlay */}
        <div
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 overflow-hidden transition-all duration-200 ${sizePreset.widthClass} ${sizePreset.topClass}`}
          style={
            applyFeatheredVignette
              ? {
                  WebkitMaskImage:
                    "radial-gradient(ellipse 84% 86% at 50% 48%, black 58%, transparent 98%)",
                  maskImage:
                    "radial-gradient(ellipse 84% 86% at 50% 48%, black 58%, transparent 98%)",
                }
              : undefined
          }
        >
          {processedDataUrl ? (
            <div className="relative">
              <img
                src={processedDataUrl}
                alt="Estampa sublimada posicionada no tórax da camiseta"
                referrerPolicy="no-referrer"
                className={`aspect-[3/4] w-full object-cover ${
                  shirt.isLightFabric ? "mix-blend-multiply opacity-95" : "opacity-95"
                }`}
              />
              {/* Subtle vertical fabric contour shading over the print for realistic wrap */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(19,11,32,0.16) 0%, rgba(255,255,255,0.06) 46%, rgba(19,11,32,0.18) 100%)",
                }}
              />
            </div>
          ) : (
            <div className="aspect-[3/4] w-full bg-[#1C102A]" />
          )}
        </div>
      </div>

      {/* Bottom Fabric Colorway Swatch Selector */}
      <div className="z-10 flex flex-wrap items-center justify-center gap-1.5">
        {SHIRT_COLORWAYS.map((cw) => {
          const active = colorId === cw.id;
          return (
            <button
              key={cw.id}
              type="button"
              onClick={() => setColorId(cw.id)}
              aria-label={cw.label}
              title={cw.label}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? "border-[#F03FA8] bg-[#130B20]/95 text-[#F8F4FF] ring-1 ring-[#F03FA8]/40"
                  : "border-white/15 bg-[#130B20]/70 text-[#C4B5E3] hover:border-white/35 hover:text-[#F8F4FF]"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-sm border border-white/30"
                style={{ backgroundColor: cw.swatch }}
              />
              <span>{cw.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
