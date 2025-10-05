import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientButton from "./GradientButton";
import StepDots from "./StepDots";
import WheelPicker from "./WheelPicker";
import MoodFace from "./MoodFace";
import StreamingText from "./StreamingText";
import TypingDots from "./TypingDots";

type Message = { id:string; role:"user"|"assistant"; text:string; ts:number };
type Route = "age"|"name"|"mood"|"chat";

const uid = ()=>Math.random().toString(36).slice(2,10);

// простое локальное хранилище чата
const KEY = "anima-pwa-chat";
const load = ():Message[] => { try { return JSON.parse(localStorage.getItem(KEY)||"[]") } catch { return [] } }
const save = (m:Message[]) => localStorage.setItem(KEY, JSON.stringify(m));

// бот-ответ (человечный короткий)
function replyLikeHuman(text:string){
  return "I hear you. My take: pick the simplest next step and test it.";
}

// стеклянная «карточка-айфон» по центру
function Shell({children}:{children:React.ReactNode}){
  return (
    <div className="min-h-full flex items-center justify-center px-5 py-8">
      <motion.div
        initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        className="relative w-full max-w-sm glass rounded-xl2 px-6 pt-10 pb-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-white/45"/>
        {children}
      </motion.div>
    </div>
  );
}

export default function App(){
  const [route,setRoute] = React.useState<Route>("age");
  const [age,setAge] = React.useState<number>(16);
  const [name,setName] = React.useState<string>("");
  const [mood,setMood] = React.useState<number>(50);

  // чат
  const [msgs,setMsgs] = React.useState<Message[]>(load());
  const [input,setInput] = React.useState(""); const [loading,setLoading]=React.useState(false);

  async function send(){
    const text = input.trim(); if(!text) return;
    setInput("");
    const next=[...msgs,{id:uid(),role:"user",text,ts:Date.now()}];
    setMsgs(next); save(next); setLoading(true);
    await new Promise(r=>setTimeout(r,500));
    const bot={id:uid(),role:"assistant",text:replyLikeHuman(text),ts:Date.now()};
    const n2=[...next,bot]; setMsgs(n2); save(n2); setLoading(false);
  }

  const ages = Array.from({length:70},(_,i)=>i+10);

  return (
    <div className="min-h-full">
      <AnimatePresence mode="wait">
        {route==="age" && (
          <Shell>
            <h1 className="hi text-center mb-6">How old are<br/>you?</h1>
            <WheelPicker values={ages} value={age} onChange={v=>setAge(Number(v))}/>
            <StepDots step={0} total={3}/>
            <GradientButton onClick={()=>setRoute("name")}>Continue</GradientButton>
            <div className="text-center text-xs opacity-60 mt-2">Back</div>
          </Shell>
        )}

        {route==="name" && (
          <Shell>
            <h1 className="hi text-center mb-4">How should I<br/>address you?</h1>
            <div className="glass rounded-2xl p-3 mb-4">
              <input
                placeholder="Artu"
                value={name}
                onChange={e=>setName(e.target.value)}
                className="w-full bg-transparent outline-none text-[18px]" />
              <div className="text-[11px] opacity-70 mt-2">
                You don't have to use your real name — a pseudonym is OK.
              </div>
            </div>
            <StepDots step={1} total={3}/>
            <GradientButton onClick={()=>setRoute("mood")}>Continue</GradientButton>
            <div className="text-center text-xs opacity-60 mt-2">Back</div>
          </Shell>
        )}

        {route==="mood" && (
          <Shell>
            <h1 className="hi text-center mb-2">How is your<br/>mood?</h1>
            {/* оранж/жёлт/зелёный градиент как на референсе */}
            <div className={`rounded-[28px] p-6 text-white bg-gradient-to-b ${
                  mood<33 ? "from-[#CC864C] to-[#E3A868]"
                  : mood<66 ? "from-[#E7B86E] to-[#F2CD8B]"
                  : "from-[#86D39C] to-[#A7E5B9]"
                } mb-4`}>
              <MoodFace value={mood}/>
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-90">Bad</span>
                <input type="range" min={0} max={100} value={mood}
                  onChange={e=>setMood(parseInt(e.target.value))}
                  className="flex-1" />
                <span className="text-xs opacity-90">Good</span>
              </div>
            </div>
            <StepDots step={2} total={3}/>
            <GradientButton onClick={()=>setRoute("chat")}>Continue</GradientButton>
            <div className="text-center text-xs opacity-60 mt-2">Back</div>
          </Shell>
        )}

        {route==="chat" && (
          <div className="max-w-xl mx-auto px-4 py-6">
            <div className="glass rounded-xl2 p-4">
              <div className="min-h-[55vh]">
                {msgs.map(m=>(
                  <motion.div key={m.id}
                    initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                    className={`flex ${m.role==="user"?"justify-end":"justify-start"} my-2`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow
                       ${m.role==="user"?"bg-white/90":"bg-white/70 border border-black/5"}`}>
                      {m.role==="assistant" ? <StreamingText text={m.text}/> : m.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start my-2">
                    <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-white/70 border border-black/5">
                      <TypingDots/>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 px-3 py-3 rounded-2xl bg-white/80 border border-black/10"
                  placeholder="type your prompt here"
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter") send() }} />
                <button onClick={send} className="px-5 rounded-2xl btn-grad text-white font-semibold">→</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
