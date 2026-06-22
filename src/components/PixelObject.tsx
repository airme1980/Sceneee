"use client";

import type { CSSProperties, ReactNode } from "react";

type PixelObjectProps = {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
};

export function PixelObject({ ariaLabel, children, className = "", onClick, style }: PixelObjectProps) {
  const sharedClassName = `absolute z-10 ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className={`${sharedClassName} cursor-pointer transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-yellow-200`}
        style={style}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={sharedClassName} style={style}>
      {children}
    </div>
  );
}
