// src/ui/ChatView.tsx
import React from "react";
import { getLang } from "../lib/i18n";

type Message = { id: string; role: 'user'|'assistant'; text: string; ts: number };

const uid = () => Math.random().toString(36).slice(2,10);

// локальное хранилище сообщений по chatId
function keyForChat(chatId:string){ return `anima-chat-${chatId}` }
function loadMessages(chatId:string): Message[] {
  try { return JSON.parse(localStorage.getItem(keyForChat(chatId)) || '[]') } catch { return [] }
}
function saveMessages(chatId:string, msgs:Message[]) {
  localStorage.setItem(keyForChat(chatId), JSON.stringify(msgs))
}

// профиль из онбординга (если ты это сохраняешь в LS)
function getProfile() {
  try { return JSON.parse(localStorage.getItem('anima-onb') || '{}') } catch { return {} }
}

export default function ChatView({ chatId, name }:{ chatId:string; name?:string }){
  const [msgs,setMsgs]=React.useState<Message[]>(()=>loadMessages(chatId));
  const [input,setInput]=React.useState("");
  const [loading,setLoading]=React.useState(false);

  React.useEffect(()=>{ setMsgs(loadMessages(chatId)); setInput('') },[chatId]);

  async function send(){
    const text = input.trim(); if(!text) return;
    setInput("");

    // 1) пользовательское
    const user: Message = { id: uid(), role: 'user', text, ts: Date.now() };
    const withUser = [...msgs, user];
    setMsgs(withUser); saveMessages(chatId, withUser);

    // 2) пустое ассистентское для “допечатки”
    const bot: Message = { id: uid(), role: 'assistant', text: "", ts: Date.now() };
    setMsgs(prev => [...prev, bot]); saveMessages(chatId, [...withUser, bot]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...withUser],
          lang: getLang(),
          profile: getProfile(),
        })
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        updateBot(bot.id, `Ошибка: ${errText || res.status}`);
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
        if (chunk) {
          setMsgs(prev => prev.map(m => m.id===bot.id ? { ...m, text: m.text + chunk } : m));
        }
      }

      // сохранить финально
      let current: Message[] = [];
      setMsgs(prev => (current = prev, prev));
      saveMessages(chatId, current);
    } catch (e:any) {
      updateBot(bot.id, 'Сеть недоступна. Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  function updateBot(id:string, text:string){
    setMsgs(prev => prev.map(m => m.id===id ? ({ ...m, text }) : m));
    saveMessages(chatId, msgs);
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto p-4">
        {msgs.map(m=>(
          <div key={m.id} className={`flex ${m.role==='user'?'justify-end':'justify-start'} my-2`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed glass ${m.role==='user'?'bg-white/90':'bg-white/75 border border-black/5'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start my-2">
            <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-white/75 border border-black/5">…</div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-black/10">
        <div className="flex gap-2">
          <input
            className="flex-1 input px-3 py-3 rounded-2xl bg-white/80 border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Напиши сюда…"
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter') send() }}
          />
          <button className="btn-grad px-4 py-3 rounded-2xl text-white" onClick={send}>Отправить</button>
        </div>
      </div>
    </div>
  );
}
