import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GradientButton from './GradientButton'
import StepDots from './StepDots'
import WheelPicker from './WheelPicker'
import MoodFace from './MoodFace'
import StreamingText from './StreamingText'
import TypingDots from './TypingDots'
import { t, getLang } from '../lib/i18n'
import { startSession, stopSession, isLockedToday, remainingMsToday, formatMmSs } from '../lib/usage'
import ChatList, { loadChats, saveChats, type ChatMeta } from './ChatList'

type Message = { id:string; role:'user'|'assistant'; text:string; ts:number }
type Route = 'age'|'name'|'mood'|'chat'
type Profile = { age?:number; name?:string; mood?:string[] }
const uid = () => Math.random().toString(36).slice(2,10)
const keyForChat = (id:string)=>`anima-chat-${id}`
const loadMsgs = (id:string):Message[] => { try {return JSON.parse(localStorage.getItem(keyForChat(id))||'[]')} catch {return []}}
const saveMsgs = (id:string,m:Message[]) => localStorage.setItem(keyForChat(id), JSON.stringify(m))

function genReply(text:string){ return 'I hear you. My take: pick the simplest next step and test it.' }

function Shell({children}:{children:React.ReactNode}) {
  return (
    <div className="min-h-full flex items-center justify-center px-5 py-8">
      <motion.div
        initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
        className="glass w-full max-w-sm rounded-xl2 px-6 pt-10 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40 pointer-events-none"/>
        {children}
      </motion.div>
    </div>
  )
}

export default function App(){
  const [route,setRoute] = React.useState<Route>('age')
  const [profile,setProfile] = React.useState<Profile>({})
  const [step,setStep] = React.useState(0)

  // чат
  const [chatId,setChatId] = React.useState<string>(() => {
    const list=loadChats(); if(list.length) return list[0].id
    const c={id:uid(), title:'General', created:Date.now()} as ChatMeta
    saveChats([c]); return c.id
  })
  const [msgs,setMsgs] = React.useState<Message[]>(()=>loadMsgs(chatId))
  const [input,setInput] = React.useState(''); const [loading,setLoading]=React.useState(false)
  React.useEffect(()=>{ setMsgs(loadMsgs(chatId)) },[chatId])

  // лимит времени
  React.useEffect(()=>{ if(route==='chat' && !isLockedToday()) startSession(); return ()=>stopSession() },[route])

  async function send(){
    const text=input.trim(); if(!text) return; if(isLockedToday()) return
    setInput('')
    const next=[...msgs,{id:uid(),role:'user',text,ts:Date.now()}]; setMsgs(next); saveMsgs(chatId,next); setLoading(true)
    await new Promise(r=>setTimeout(r,450))
    const bot={id:uid(),role:'assistant',text:genReply(text),ts:Date.now()}
    const n2=[...next,bot]; setMsgs(n2); saveMsgs(chatId,n2); setLoading(false)
  }

  // ---- экраны ----
  const ages = Array.from({length: 70}, (_,i)=>i+10)

  return (
    <div className="min-h-full">
      <AnimatePresence mode="wait">
        {route==='age' && (
          <Shell>
            <h1 className="hi text-center mb-6">How old are<br/>you?</h1>
            <WheelPicker values={ages} value={profile.age ?? 16}
              onChange={(v)=>setProfile(p=>({...p, age:Number(v)}))}/>
            <StepDots step={0} total={3}/>
            <GradientButton onClick={()=>{ setStep(1); setRoute('name') }}>
              Continue
            </GradientButton>
            <div className="text-center text-xs opacity-60 mt-2">Back</div>
          </Shell>
        )}

        {route==='name' && (
          <Shell>
            <h1 className="hi text-center mb-4">How should I<br/>address you?</h1>
            <div className="glass rounded-2xl p-3 mb-3">
              <input
                placeholder="Artu"
                className="w-full bg-transparent outline-none text-[18px]"
                onChange={e=>setProfile(p=>({...p, name:e.target.value}))}/>
              <div className="text-[11px] opacity-70 mt-2">
                You can use a pseudonym if that’s more comfortable.
              </div>
            </div>
            <StepDots step={1} total={3}/>
            <GradientButton onClick={()=>{ setStep(2); setRoute('mood') }}>Continue</GradientButton>
            <div className="text-center text-xs opacity-60 mt-2">Back</div>
          </Shell>
        )}

        {route==='mood' && (
          <Shell>
            <h1 className="hi text-center mb-2">How is your<br/>mood?</h1>
            <MoodSlider onDone={()=>setRoute('chat')}/>
            <StepDots step={2} total={3}/>
            <GradientButton onClick={()=>setRoute('chat')}>Continue</GradientButton>
            <div className="text-center text-xs opacity-60 mt-2">Back</div>
          </Shell>
        )}

        {route==='chat' && (
          <div className="max-w-xl mx-auto px-4 py-6">
            <div className="glass rounded-xl2 p-4">
              <div className="min-h-[55vh]">
                {msgs.map(m=>(
                  <motion.div key={m.id}
                    initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                    className={`flex ${m.role==='user'?'justify-end':'justify-start'} my-2`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow
                        ${m.role==='user'?'bg-white/90':'bg-white/70 border border-black/5'}`}>
                      {m.role==='assistant'? <StreamingText text={m.text}/> : m.text}
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
                <input className="flex-1 px-3 py-3 rounded-2xl bg-white/80 border border-black/10"
                  placeholder="type your prompt here" value={input}
                  onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') send() }}/>
                <button onClick={send} className="px-5 rounded-2xl btn-grad text-white font-semibold">→</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// — маленький контрол для mood, чтобы совпасть со слайдом —
function MoodSlider({onDone}:{onDone:()=>void}) {
  const [v,setV]=React.useState(50)
  const bg = v<33 ? 'from-[#CC864C] to-[#E3A868]'
                  : v<66 ? 'from-[#E7B86E] to-[#F2CD8B]'
                         : 'from-[#86D39C] to-[#A7E5B9]'
  return (
    <div className={`rounded-[28px] p-6 text-white bg-gradient-to-b ${bg} mb-4`}>
      <MoodFace value={v}/>
      <div className="flex items-center gap-3">
        <span className="text-xs opacity-90">Bad</span>
        <input type="range" min={0} max={100} value={v}
          onChange={e=>setV(parseInt(e.target.value))} className="flex-1"/>
        <span className="text-xs opacity-90">Good</span>
      </div>
    </div>
  )
}
