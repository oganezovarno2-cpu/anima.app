import React from "react";
const clamp = (v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export default function WheelPicker({
  values, value, onChange, visible = 5
}:{
  values:(string|number)[]; value:string|number; onChange:(v:string|number)=>void; visible?:number
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(()=>{
    const i = Math.max(0, values.findIndex(v=>String(v)===String(value)));
    const row = 36, el = ref.current; if(!el) return;
    el.scrollTo({ top: i*row - Math.floor(visible/2)*row, behavior:"smooth" });
  },[value,values,visible]);

  function onScroll(e: React.UIEvent<HTMLDivElement>){
    const row=36, el=e.currentTarget;
    const index = clamp(Math.round(el.scrollTop/row),0,values.length-1);
    onChange(values[index]);
  }

  return (
    <div className="relative mx-auto w-[260px]">
      {/* светлая «капсула» в середине как в макете */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-10 rounded-xl border border-white/60 bg-white/45 shadow" />
      <div ref={ref} onScroll={onScroll}
           className="h-48 overflow-y-scroll py-20 text-center">
        {values.map((v,i)=>(
          <div key={i} className="h-9 flex items-center justify-center text-[18px] text-black/55 select-none">
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}
