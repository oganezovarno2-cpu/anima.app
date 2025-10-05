import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypingDots from './TypingDots'
import StreamingText from './StreamingText'
import ChatList, { loadChats, saveChats, type ChatMeta } from './ChatList'
import { t, getLang, setLang, topicsFor, type Lang } from '../lib/i18n'
import { startSession, stopSession, isLockedToday, remainingMsToday, formatMmSs } from '../lib/usage'

type Message = { id: string; role: 'user'|'assistant'; text: string; ts: number }
type Route = 'splash'|'talk'|'proof'|'name'|'topics'|'mood'|'chat'
type Profile = { name?: string; topics?: string[]; mood?: string }

const id = () => Math.random().toString(36).slice(2,10)

// ===== storage helpers =====
function keyForChat(chatId:string){ return `anima-chat-${chatId}` }
function loadMessages(chatId:string): Message[] { try { return JSON.parse(localStorage.getItem(keyForChat(chatId)) || '[]') } catch { return [] } }
function saveMessages(chatId:string, msgs:Message[]) { localStorage.setItem(keyForChat(chatId), JSON.stringify(msgs)) }

// ===== human-like reply =====
function rand(min:number, max:number){ return Math.floor(Math.random()*(max-min+1))+min }
function pick<T>(arr:T[]){ return arr[rand(0, arr.length-1)] }

function userStyleFingerprint(history:Message[]) {
  const lastUser = [...history].reverse().find(m=>m.role==='user')
  if (!lastUser) return { short:true, emojis:false }
  const txt = lastUser.text
  return {
    short: txt.length < 60,
    emojis: /[\u{1F300}-\u{1FAFF}]/u.test(txt)
  }
}

function detectSentiment(s: string){
  const q = s.toLowerCase()
  const neg = /(плохо|тяжело|устал|страх|тревог|плач|давит|ненавижу|bad|anx|sad|tired|worried|angry|miedo|triste)/.test(q)
  const pos = /(классно|хорошо|рад|супер|огонь|nice|good|great|happy|genial|bien)/.test(q)
  return neg ? 'neg' : pos ? 'pos' : 'neu'
}

function generateReply(input:string, lang:Lang, profile:Profile, history:Message[], chatTitle:string){
  const sentiment = detectSentiment(input)
  const isQuestion = /[?¿]$/.test(input.trim())
  const style = userStyleFingerprint(history)
  const kws = (input.match(/\b[\p{L}\p{N}]{4,}\b/gu)||[]).slice(0,3)
  const mirror = kws.length ? ` ${kws.join(', ')}` : ''
  const name = profile.name ? (lang==='ru' ? `, ${profile.name}` : lang==='es' ? `, ${profile.name}` : `, ${profile.name}`) : ''
  const topicsHint = profile.topics?.length ? ` (${profile.topics.slice(0,3).join(' · ')})` : ''
  const mood = profile.mood ? (lang==='ru' ? ` Настроение: ${profile.mood}.` : lang==='es' ? ` Ánimo: ${profile.mood}.` : ` Mood: ${profile.mood}.`) : ''

  const openers = {
    en: ['I hear you', 'Got you', 'Thanks for sharing', 'Makes sense', 'I’m with you here'],
    ru: ['Понимаю тебя', 'Слышу тебя', 'Спасибо, что рассказал', 'Логично звучит', 'Я с тобой'],
    es: ['Te entiendo', 'Gracias por contarlo', 'Tiene sentido', 'Te leo', 'Estoy contigo']
  }[lang]
  const direct = {
    en: ['honestly:', 'my view:', 'if I’m blunt:', 'from what I see:'],
    ru: ['честно говоря:', 'моё мнение:', 'если прямо:', 'как я это вижу:'],
    es: ['honestamente:', 'mi opinión:', 'si soy directo:', 'como lo veo:']
  }[lang]
  const coach = {
    en_neg: ['start tiny and keep momentum', 'reduce scope and do one step', 'ask a trusted person for help'],
    en_neu: ['define the next step', 'write it and schedule it', 'talk it out in short notes'],
    en_pos: ['lock this energy into a plan', 'double down on what works', 'share the win with someone'],
    ru_neg: ['сделай крошечный шаг и набери темп', 'урежь задачу до минимума и сделай одно', 'обратись к тому, кому доверяешь'],
    ru_neu: ['определи следующий шаг', 'запиши и назначь время', 'выговорись короткими заметками'],
    ru_pos: ['зафиксируй энергию в плане', 'усиль то, что уже работает', 'поделись победой с кем-то'],
    es_neg: ['empieza diminuto y gana ritmo', 'recorta alcance y da un paso', 'pide apoyo a alguien de confianza'],
    es_neu: ['define el siguiente paso', 'escríbelo y ponlo en agenda', 'sácalo en notas cortas'],
    es_pos: ['ancla esta energía en un plan', 'duplica lo que funciona', 'comparte el logro con alguien']
  }
  const action = pick((coach as any)[`${lang}_${sentiment}`])

  const base = isQuestion
    ? (lang==='ru' ? `если выбирать, предложил бы: ${action}.`
       : lang==='es' ? `si tuviera que elegir, sugeriría: ${action}.`
       : `if I had to choose, I’d suggest: ${action}.`)
    : (lang==='ru' ? `по делу сейчас: ${action}.`
       : lang==='es' ? `lo práctico ahora: ${action}.`
       : `practically now: ${action}.`)

  const opener = pick(openers)
  const directPhrase = pick(direct)

  // персонализация по теме чата
  const room = chatTitle ? (lang==='ru' ? ` (${chatTitle})` : lang==='es' ? ` (${chatTitle})` : ` (${chatTitle})`) : ''

  // короткий vs длинный стиль + эмодзи
  const endEmoji = style.emojis ? (sentiment==='pos'?' 🙂':' 🤝') : ''
  const longTail = style.short ? '' :
    (lang==='ru' ? ' Если хочешь — разбёрём по шагам один сценарий.'
    : lang==='es' ? ' Si quieres, lo desarmamos en pasos.'
    : ' If you want, we can break it down into steps.')

  const variants = [
    `${opener}${name}${room}.${mirror ? mirror + '.' : ''} ${directPhrase} ${base}${mood}${endEmoji}${longTail}`,
    `${opener}${name}${topicsHint}.${mood} ${directPhrase} ${base}${endEmoji}`,
    `${opener}.${mirror ? mirror + ' — ' : ''}${base}${mood}${endEmoji}${longTail}`
  ]

  // не повторяться подряд
  const sig = localStorage.getItem('anima-last-reply')
  let out = pick(variants)
  let tries = 0
  while (out === sig && tries < 3) { out = pick(variants); tries++ }
  localStorage.setItem('anima-last-reply', out)
  return out.replace(/\s+/g,' ').trim()
}

// ===== UI bits =====
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
          <h1 className="text-sm font-semibold tracking-wide">Anima</h1>
          <p className="text-xs opacity-70 -mt-0.5">{t('appTag')}</p>
        </div>
        <select value={lang} onChange={switchLang} className="text-xs px-2 py-1 rounded-full bg-white/70 shadow border">
          <option value="en">EN</option><option value="ru">RU</option><option value="es">ES</option>
        </select>
      </div>
    </header>
  )
}

function Card({ children, footer }: { children: React.ReactNode, footer?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: .98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: .98 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="rounded-[28px] p-6 bg-white/50 shadow-glow border border-black/5 backdrop-blur text-center"
    >
      {children}
      {footer && <div className="mt-5">{footer}</div>}
    </motion.div>
  )
}

function Splash({ onNext }: { onNext: ()=>void }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card footer={<button onClick={onNext} className="w-full py-3 rounded-2xl bg-black text-white transition-all hover:opacity-90 active:scale-[0.98]">{t('continue')}</button>}>
        {/* добавил фото/картинку */}
        <motion.img initial={{opacity:0,scale:.98}} animate={{opacity:1,scale:1}} transition={{duration:.4}}
          src="/illus/hero.svg" alt="hero" className="h-72 w-full object-cover rounded-3xl" />
      </Card>
    </div>
  )
}
function Talk({ onNext }: { onNext: ()=>void }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card footer={<button onClick={onNext} className="w-full py-3 rounded-2xl bg-black text-white transition-all hover:opacity-90 active:scale-[0.98]">{t('continue')}</button>}>
        <h2 className="text-2xl font-semibold mb-4">{t('talk_title')}</h2>
        <motion.img initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.3}}
          src="/illus/proof.svg" alt="proof" className="mx-auto rounded-2xl shadow mb-4"/>
        <p className="text-sm opacity-80">{t('talk_sub')}</p>
      </Card>
    </div>
  )
}

function Paywall() {
  const remain = remainingMsToday()
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card>
        <h2 className="text-2xl font-semibold mb-2">Anima Pro — $10/month</h2>
        <p className="opacity-80 mb-2">Daily free limit used (15 min). Time resets tomorrow.</p>
        <p className="text-sm opacity-70">Time left today: {formatMmSs(remain)}</p>
        {/* TODO: подключим Stripe здесь позже после 15 минут/день */}
      </Card>
    </div>
  )
}

// ===== Main App =====
export default function App() {
  const [route,setRoute] = React.useState<Route>('splash')
  const [profile, setProfile] = React.useState<Profile>({})
  const [chatId, setChatId] = React.useState<string>(() => {
    const list = loadChats()
    if (list.length) return list[0].id
    const c = { id: id(), title: 'General', created: Date.now() } as ChatMeta
    saveChats([c]); return c.id
  })
  const [messages, setMessages] = React.useState<Message[]>(() => loadMessages(chatId))
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(()=>{ setMessages(loadMessages(chatId)) }, [chatId])

  // учет времени: старт при входе в чат, стоп при уходе
  React.useEffect(()=>{
    if (route==='chat' && !isLockedToday()) startSession()
    return () => stopSession()
  }, [route])

  function createChat() {
    const title = prompt('Chat title')?.trim() || `Chat ${new Date().toLocaleTimeString()}`
    const list = loadChats()
    const c = { id: id(), title, created: Date.now() } as ChatMeta
    saveChats([c, ...list])
    setChatId(c.id)
    setMessages([])
    saveMessages(c.id, [])
  }
  function deleteChat(idDel: string) {
    const list = loadChats().filter(c=>c.id!==idDel)
    saveChats(list)
    localStorage.removeItem(keyForChat(idDel))
    if (chatId===idDel && list.length) setChatId(list[0].id)
    if (!list.length) createChat()
  }

  async function send() {
    const text = input.trim()
    if (!text) return
    if (isLockedToday()) return

    setInput('')
    const userMsg: Message = { id: id(), role: 'user', text, ts: Date.now() }
    const next = [...messages, userMsg]
    setMessages(next); saveMessages(chatId, next)
    setLoading(true)

    await new Promise(r=>setTimeout(r, 200 + Math.random()*300))
    const reply = generateReply(text, getLang(), profile, next, loadChats().find(c=>c.id===chatId)?.title || 'Chat')
    const botMsg: Message = { id: id(), role: 'assistant', text: reply, ts: Date.now() }
    const next2 = [...next, botMsg]
    setMessages(next2); saveMessages(chatId, next2)
    setLoading(false)
  }

  if (isLockedToday() && route==='chat') return (
    <div className="min-h-full flex flex-col">
      <Header />
      <Paywall />
    </div>
  )

  return (
    <div className="min-h-full flex flex-col">
      <Header />

      {/* список чатов */}
      <ChatList
        current={chatId}
        onSelect={setChatId}
        onCreate={createChat}
        onDelete={deleteChat}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {route==='splash' && (
            <motion.div key="splash"><Splash onNext={()=>setRoute('talk')} /></motion.div>
          )}
          {route==='talk' && (
            <motion.div key="talk"><Talk onNext={()=>setRoute('name')} /></motion.div>
          )}

          {route==='name' && (
            <motion.div key="name">
              <div className="mx-auto max-w-sm px-4 py-6">
                <Card footer={<button onClick={()=>setRoute('topics')} className="w-full py-3 rounded-2xl bg-black text-white transition-all hover:opacity-90 active:scale-[0.98]">{t('continue')}</button>}>
                  <h2 className="text-xl font-semibold mb-2">{t('name_title')}</h2>
                  <input onChange={e=>setProfile(p=>({...p, name:e.target.value}))} placeholder={t('name_placeholder')}
                    className="w-full px-3 py-3 rounded-2xl bg-white/80 border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all" />
                  <p className="text-xs opacity-70 mt-2">{t('name_hint')}</p>
                </Card>
              </div>
            </motion.div>
          )}

          {route==='topics' && (
            <motion.div key="topics">
              <div className="mx-auto max-w-sm px-4 py-6">
                <Card footer={<button onClick={()=>setRoute('mood')} className="w-full py-3 rounded-2xl bg-black text-white">{t('continue')}</button>}>
                  <h2 className="text-xl font-semibold mb-3">{t('topics_title')}</h2>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {topicsFor(getLang()).map(x=>(
                      <button key={x} onClick={()=>setProfile(p=>({...p, topics: (p.topics||[]).includes(x)? (p.topics||[]).filter(i=>i!==x): [...(p.topics||[]), x]}))}
                        className={`px-3 py-1 rounded-2xl border ${ (profile.topics||[]).includes(x)?'bg-black text-white':'bg-white/80 border-black/10'}`}>
                        {x}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {route==='mood' && (
            <motion.div key="mood">
              <div className="mx-auto max-w-sm px-4 py-6">
                <Card footer={<button onClick={()=>setRoute('chat')} className="w-full py-3 rounded-2xl bg-black text-white">{t('continue')}</button>}>
                  <h2 className="text-xl font-semibold mb-3">{t('mood_title')}</h2>
                  <div className="flex gap-2 justify-center">
                    {['BAD','NOT BAD','GOOD'].map(m=>(
                      <button key={m} onClick={()=>setProfile(p=>({...p, mood:m}))}
                        className={`px-3 py-1 rounded-2xl border ${profile.mood===m?'bg-black text-white':'bg-white/80 border-black/10'}`}>{m}</button>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {route==='chat' && (
            <motion.div key="chat">
              <div className="mx-auto max-w-sm px-4 py-6">
                <div className="rounded-[28px] p-4 bg-white/40 shadow-glow border border-black/5 backdrop-blur">
                  <div className="min-h-[50vh]">
                    <AnimatePresence initial={false}>
                      {messages.map(m=>(
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 10, scale: .98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: .98 }}
                          transition={{ duration: .2 }}
                          className={`flex ${m.role==='user'?'justify-end':'justify-start'} my-2`}
                        >
                          <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow ${m.role==='user'?'bg-white/90':'bg-white/75 border border-black/5'}`}>
                            {m.role==='assistant' ? <StreamingText text={m.text} /> : m.text}
                          </div>
                        </motion.div>
                      ))}
                      {loading && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex justify-start my-2">
                          <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-white/75 border border-black/5">
                            <TypingDots />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input className="flex-1 px-3 py-3 rounded-2xl bg-white/80 border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all"
                      placeholder={t('chat_placeholder')}
                      value={input}
                      onChange={e=>setInput(e.target.value)}
                      onKeyDown={e=>{ if(e.key==='Enter') send() }} />
                    <button className="px-4 py-3 rounded-2xl bg-black text-white transition-all hover:opacity-90 active:scale-[0.98]" onClick={send}>{t('send')}</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center text-xs opacity-70 py-6">{t('footer', { year: new Date().getFullYear() })}</footer>
    </div>
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
