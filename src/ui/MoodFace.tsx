import React from "react";
export default function MoodFace({ value }:{ value:number }) {
  const label = value<33 ? "BAD" : value<66 ? "NOT BAD" : "GOOD";
  const emoji = value<33 ? "😞" : value<66 ? "😐" : "😊";
  return (
    <div className="flex flex-col items-center my-6">
      <div className="text-6xl">{emoji}</div>
      <div className="mt-2 text-white/95 font-semibold text-lg">{label}</div>
    </div>
  );
}
