import React from "react";

interface EgyptianPatternProps {
  className?: string;
  size?: number;
}

export const EgyptianCardBack: React.FC<EgyptianPatternProps> = ({
  className = "w-full h-full",
}) => {
  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center select-none shadow-md ${className}`}
      style={{
        background: "linear-gradient(135deg, #092c35 0%, #0d3b46 50%, #061e24 100%)",
        border: "2px solid #c59b27",
      }}
    >
      {/* Corner Egyptian Golden Ornaments */}
      <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 w-2.5 h-2.5 sm:w-4 sm:h-4 border-t sm:border-t-2 border-l sm:border-l-2 border-amber-400/80 rounded-tl-xs sm:rounded-tl-sm pointer-events-none" />
      <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2.5 h-2.5 sm:w-4 sm:h-4 border-t sm:border-t-2 border-r sm:border-r-2 border-amber-400/80 rounded-tr-xs sm:rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 w-2.5 h-2.5 sm:w-4 sm:h-4 border-b sm:border-b-2 border-l sm:border-l-2 border-amber-400/80 rounded-bl-xs sm:rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-2.5 h-2.5 sm:w-4 sm:h-4 border-b sm:border-b-2 border-r sm:border-r-2 border-amber-400/80 rounded-br-xs sm:rounded-br-sm pointer-events-none" />

      {/* Central Khayamiya Star Medallion */}
      <svg
        viewBox="0 0 100 100"
        className="w-8 h-8 xs:w-11 xs:h-11 sm:w-16 sm:h-16 opacity-95 transition-transform duration-300 group-hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="44" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="50" cy="50" r="38" stroke="#D4AF37" strokeWidth="1" opacity="0.6" />

        {/* 8-pointed star in gold */}
        <polygon
          points="50,16 57,36 78,36 61,48 67,69 50,56 33,69 39,48 22,36 43,36"
          fill="#D4AF37"
          opacity="0.9"
        />
        {/* Inner rotated star */}
        <polygon
          points="50,22 55,38 72,38 58,48 63,64 50,54 37,64 42,48 28,38 45,38"
          fill="#0D3B46"
        />
        {/* Center Golden Eye/Sun disc */}
        <circle cx="50" cy="50" r="8" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3" fill="#0D3B46" />

        {/* Small diagonal accent petals */}
        <circle cx="50" cy="8" r="2" fill="#D4AF37" />
        <circle cx="50" cy="92" r="2" fill="#D4AF37" />
        <circle cx="8" cy="50" r="2" fill="#D4AF37" />
        <circle cx="92" cy="50" r="2" fill="#D4AF37" />
      </svg>
    </div>
  );
};

