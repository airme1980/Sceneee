"use client";

type PixelNpcProps = {
  name: string;
  role: string;
  color: string;
  x: string;
  y: string;
  onClick?: () => void;
};

export function PixelNpc({ color, name, onClick, role, x, y }: PixelNpcProps) {
  const content = (
    <>
      <span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap border-2 border-slate-950 bg-white px-2 py-1 font-pixel text-[10px] font-bold text-slate-950 group-hover:block">
        {name}
      </span>
      <span className="mb-1 rounded-sm border-2 border-slate-950 bg-white px-1.5 py-0.5 font-pixel text-[9px] font-bold text-slate-800">
        {role}
      </span>
      <span className="relative block h-16 w-12">
        <span className="absolute left-1/2 top-0 h-7 w-7 -translate-x-1/2 border-[3px] border-slate-950 bg-[#f3c7a8]" />
        <span
          className="absolute left-1/2 top-7 h-8 w-10 -translate-x-1/2 border-[3px] border-slate-950"
          style={{ backgroundColor: color }}
        />
        <span className="absolute bottom-0 left-1.5 h-4 w-4 border-[3px] border-slate-950 bg-slate-700" />
        <span className="absolute bottom-0 right-1.5 h-4 w-4 border-[3px] border-slate-950 bg-slate-700" />
      </span>
    </>
  );

  const className =
    "group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus:outline-none focus:ring-4 focus:ring-yellow-200";

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={`Talk to ${name}`}
        onClick={onClick}
        className={`${className} cursor-pointer transition hover:-translate-y-[54%]`}
        style={{ left: x, top: y }}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} style={{ left: x, top: y }}>
      {content}
    </div>
  );
}
