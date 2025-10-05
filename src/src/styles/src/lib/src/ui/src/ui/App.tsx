import React from 'react'
import TypingDots from './TypingDots'
import { t, getLang, setLang, topicsFor, type Lang } from '../lib/i18n'

type Message = { id: string; role: 'user'|'assistant'; text: string; ts: number }
const KEY = 'anima-chat-v1'
const id = () => Math.random().toString(36).slice(2,10)
const loadMessages = (): Message[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const saveMessages = (msgs: Message[]) => localStorage.setItem(KEY, JSON.stringify(msgs))

type Route = 'splash'|'talk'|'proof'|'name'|'topics'|'mood'|'chat'

function Header() {
  const [lang, set] = React.useState<Lang>(getLang())
  function switchLang(e: React.ChangeEvent<HTMLSelectElement>) {
    setLang(e.target.value as Lang); set(e.target.value as Lang); location.reload()
  }
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/30 border-b border-black/5">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <img src="/logo.svg" className="w-8 h-8 rounded-full shadow-glow" alt="Anima" />
        <div className="flex-1">
          <h1 className="text-sm font-semibold tracking-wide">{t('appName')}</h1>
          <p className="text-xs opacity-70 -mt-0.5">{t('appTag')}</p>
        </div>
        <select value={lang} onChange={switchLang} className="text-xs px-2 py-1 rounded-full bg-white/70 shadow border">
          <option value="en">EN</option><option value="ru">RU</option><option value="es">ES</option>
        </select>
      </div>
    </header>
  )
}

function Screen({ children, footer }: { children: React.ReactNode, footer?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <div className="rounded-[28px] p-6 bg-white/50 shadow-glow border border-black/5 backdrop-blur text-center">
        {children}
        {footer && <div className="mt-5">{footer}</div>}
      </div>
    </div>
  )
}

function Splash({ onNext }: { onNext: ()=>void }) {
  return (
    <Screen footer={<button onClick={onNext} className="w-full py-3 rounded-2xl bg-black text-white">{t('continue')}</button>}>
      <div className="h-72 rounded-3xl" style={{background:'linear-gradient(135deg,#fde2f1,#e6e1ff)'}} />
    </Screen>
  )
}

function Talk({ onNext }: { onNext: ()=>void }) {
  return (
    <Screen footer={<button onClick={onNext} className="w-full py-3 rounded-2xl bg-black text-white">{t('continue')}</button>}>
      <h2 className="text-2xl font-semibold mb-4">{t('talk_title')}</h2>
      <img src="/illus/hero.svg" alt="hero" className="mx-auto rounded-2xl shadow mb-4"/>
      <p className="text-sm opacity-80">{t('talk_sub')}</p>
    </Screen>
  )
}

function Proof({ onNext }: { onNext: ()=>void }) {
  return (
    <Screen footer={<button onClick={onNext} className="w-full py-3 rounded-2xl bg-black text-white">{t('continue')}</button>}>
      <h2 className="text-xl font-semibold mb-3">{t('proof_title')}</h2>
      <img src="/illus/proof.svg" alt="proof" className="mx-auto rounded-2xl shadow"/>
    </Screen>
  )
}

function NameForm({ onNext }: { onNext: (name:string)=>void }) {
  const [name,setName] = React.useState('')
  return (
    <Screen footer={<button onClick={()=>onNext(name)} className="w-full py-3 rounded-2xl bg-black text-white">{t('continue')}</button>}>
      <h2 className="text-xl font-semibold mb-2">{t('name_title')}</h2>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder={t('name_placeholder')}
        className="w-full px-3 py-3 rounded-2xl bg-white/80 border border-black/10" />
      <p className="text-xs opacity-70 mt-2">{t('name_hint')}</p>
    </Screen>
  )
}

function Topics({ onNext }: { onNext:(sel:string[])=>void }) {
  const [sel,setSel] = React.useState<string[]>([])
  const TOPICS = topicsFor(getLang())
  function toggle(t:string){ setSel(s => s.includes(t)? s.filter(x=>x!==t): [...s,t]) }
  return (
    <Screen footer={<button onClick={()=>onNext(sel)} className="w-full py-3 rounded-2xl bg-black text-white">{t('continue')}</button>}>
      <h2 className="text-xl font-semibold mb-3">{t('topics_title')}</h2>
      <div className="flex flex-wrap gap-2 justify-center">
        {TOPICS.map(ti=> (
          <button key={ti} onClick={()=>toggle(ti)} className={`px-3 py-1 rounded-2xl border ${sel.includes(ti)?'bg-black text-white':'bg-white/80 border-black/10'}`}>{ti}</button>
        ))}
      </div>
    </Screen>
  )
}

function Mood({ onNext }: { onNext:(mood:string)=>void }) {
  const [v,setV] = React.useState(50)
  let bg = 'linear-gradient(135deg,#ffe3e3,#ffb3b3)'
  let label = t('mood_bad')
  if (v>=33 && v<66){ bg='linear-gradient(135deg,#ffe9d1,#f9c97a)'; label=t('mood_mid') }
  if (v>=66){ bg='linear-gradient(135deg,#d5f7cf,#8ee08b)'; label=t('mood_good') }
  return (
    <Screen footer={<button onClick={()=>onNext(label)} className="w-full py-3 rounded-2xl bg-black text-white">{t('continue')}</button>}>
      <div className="rounded-[28px] p-6 text-white" style={{background:bg}}>
        <h2 className="text-xl font-semibold mb-1">{t('mood_title')}</h2>
        <div className="text-5xl my-4">{label===t('mood_bad')?'😞':label===t('mood_mid')?'😐':'😊'}</div>
        <input type="range" min={0} max={100} value={v} onChange={e=>setV(parseInt(e.target.value))} className="w-full" />
        <div className="flex justify-between text-xs mt-1 opacity-90">
          <span>{t('mood_bad')}</span><span>{t('mood_mid')}</span><span>{t('mood_good')}</span>
        </div>
      </div>
    </Screen>
  )
}

function Paywall() {
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <div className="rounded-[28px] p-6 bg-white/60 shadow-glow border border-black/5 backdrop-blur text-center">
        <h2 className="text-2xl font-semibold mb-2">Anima Pro — $10/month</h2>
        <p className="opacity-80 mb-4">You’ve used 3 free dialogues. To continue, please subscribe. (MVP: payments later)</p>
      </div>
    </div>
  )
}

function Chat({ name }: { name?: string }) {
  const [msgs, setMsgs] = React.useState<Message[]>(loadMessages())
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // 3 free dialogues limit
  const [dialogCount, setDialogCount] = React.useState<number>(parseInt(localStorage.getItem('anima-dialogs')||'0',10))
  const [locked, setLocked] = React.useState<boolean>(dialogCount >= 3)
  const [startedThisDialog, setStartedThisDialog] = React.useState<boolean>(false)

  function generateReply(text:string) {
    const langSel = (localStorage.getItem('anima-lang')||'en').slice(0,2)
    const isQuestion = /[?¿]$/.test(text.trim())
    const keywords = (text.match(/\b[\p{L}\p{N}]{4,}\b/gu)||[]).slice(0,3)
    const mirror = keywords.length ? ` ${keywords.join(', ')}` : ''
    let opener = langSel==='ru' ? 'Понимаю тебя.' : langSel==='es' ? 'Te entiendo.' : 'I hear you.'
    let opinion = isQuestion
      ? (langSel==='ru' ? ' Моё мнение: если выбрать одно — сделай проще и проверь результат.' :
         langSel==='es' ? ' Mi opinión: si tienes que elegir, elige lo simple y pruébalo.' :
                          ' My take: if you must choose, pick the simple path and test it.')
      : (langSel==='ru' ? ' Моё мнение: ты справишься. Действуй маленькими шагами.' :
         langSel==='es' ? ' Mi opinión: lo vas a lograr. Avanza en pasos pequeños.' :
                          ' My take: you got this. Move in small steps.')
    const cultural = (langSel==='ru') ? ' Учитываю контекст и говорю прямо.' :
                     (langSel==='es') ? ' Considero el contexto y hablo directo.' :
                                        ' I consider context and speak plainly.'
    return `${opener}${mirror}. ${cultural}${opinion}`.trim()
  }

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    if (locked) return

    const wasEmpty = msgs.length === 0 && !startedThisDialog
    if (wasEmpty) {
      const newCount = dialogCount + 1
      localStorage.setItem('anima-dialogs', String(newCount))
      setDialogCount(newCount); setStartedThisDialog(true)
      if (newCount > 3) { setLocked(true) }
    }

    setInput('')
    const userMsg: Message = { id: id(), role: 'user', text, ts: Date.now() }
    const next = [...msgs, userMsg]
    setMsgs(next); saveMessages(next)
    setLoading(true)
    await new Promise(r=>setTimeout(r,600))
    const botMsg: Message = { id: id(), role: 'assistant', text: generateReply(text), ts: Date.now() }
    const next2 = [...next, botMsg]
    setMsgs(next2); saveMessages(next2)
    setLoading(false)
  }

  if (locked) return <Paywall />

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <div className="rounded-[28px] p-4 bg-white/40 shadow-glow border border-black/5 backdrop-blur">
        <div className="min-h-[50vh]">
          {msgs.map(m=>(
            <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'} my-2`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow ${m.role==='user'?'bg-white/90':'bg-white/75 border border-black/5'}`}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start my-2">
              <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-white/75 border border-black/5">
                <TypingDots />
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input className="flex-1 px-3 py-3 rounded-2xl bg-white/80 border border-black/10" placeholder={t('chat_placeholder')} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handleSend() }} />
          <button className="px-4 py-3 rounded-2xl bg-black text-white" onClick={handleSend}>{t('send')}</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [route,setRoute] = React.useState<Route>('splash')

  return (
    <div className="min-h-full flex flex-col">
      <Header />
      <main className="flex-1">
        {route==='splash' && <Splash onNext={()=>setRoute('talk')} />}
        {route==='talk' && <Talk onNext={()=>setRoute('proof')} />}
        {route==='proof' && <Proof onNext={()=>setRoute('name')} />}
        {route==='name' && <NameForm onNext={()=>setRoute('topics')} />}
        {route==='topics' && <Topics onNext={()=>setRoute('mood')} />}
        {route==='mood' && <Mood onNext={()=>setRoute('chat')} />}
        {route==='chat' && <Chat />}
      </main>
      <footer className="text-center text-xs opacity-70 py-6">{t('footer', { year: new Date().getFullYear() })}</footer>
    </div>
  )
}
