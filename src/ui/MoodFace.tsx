import React from "react";
export default function MoodFace({value}:{value:number}) {
  const eyesY = value<33?6:value<66?0:-2
  const mouth = value<33?'😞':value<66?'😐':'😊'
  return (
    <div className="flex flex-col items-center my-6">
      <div className="text-6xl">{mouth}</div>
      <div className="mt-2 text-white/90 font-semibold text-lg">
        {value<33?'BAD':value<66?'NOT BAD':'GOOD'}
      </div>
    </div>
  )
}
