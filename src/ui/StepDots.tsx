import React from "react";
export default function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 my-5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === step ? "w-5 bg-anima-ink/80" : "w-2 bg-anima-ink/25"
          }`}
        />
      ))}
    </div>
  );
}
