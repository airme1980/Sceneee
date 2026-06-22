"use client";

import type { CSSProperties, ReactNode } from "react";

type PixelObjectProps = {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  explored?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
};

export function PixelObject({
  ariaLabel,
  children,
  className = "",
  explored = false,
  onClick,
  style,
}: PixelObjectProps) {
  const sharedClassName = `absolute z-10 ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className={`${sharedClassName} group cursor-pointer transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-yellow-200 ${
          explored ? "ring-4 ring-emerald-300/60" : "animate-pulse ring-4 ring-yellow-200/40"
        }`}
        style={style}
      >
        {children}
        {explored ? (
          <span className="absolute -right-3 -top-3 grid h-6 w-6 place-items-center border-2 border-slate-950 bg-emerald-400 font-pixel text-[10px] font-bold text-slate-950">
            ✓
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div className={sharedClassName} style={style}>
      {children}
    </div>
  );
}
