import React from 'react'

export type ChatMeta = { id: string; title: string; created: number }
const LIST_KEY = 'anima-chat-list'

export function loadChats(): ChatMeta[] {
  try { return JSON.parse(localStorage.getItem(LIST_KEY) || '[]') } catch { return [] }
}
export function saveChats(list: ChatMeta[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list))
}

export default function ChatList({ current, onSelect, onCreate, onDelete }:{
  current?: string,
  onSelect: (id:string)=>void,
  onCreate: ()=>void,
  onDelete: (id:string)=>void
}) {
  const [list, setList] = React.useState<ChatMeta[]>(loadChats())

  React.useEffect(() => {
    const onStorage = () => setList(loadChats())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div className="mx-auto max-w-sm px-4 pt-3 pb-1">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold opacity-80">Your chats</div>
        <button onClick={()=>{ onCreate(); setList(loadChats()) }} className="text-xs px-2 py-1 rounded-full bg-black text-white">New</button>
      </div>
      <div className="flex gap-2 overflow-auto pb-1">
        {list.map(c => (
          <button key={c.id}
            onClick={()=>onSelect(c.id)}
            className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap ${current===c.id?'bg-black text-white':'bg-white/80 border-black/10'}`}>
            {c.title}
            <span onClick={(e)=>{ e.stopPropagation(); onDelete(c.id); setList(loadChats()) }} className="ml-2 opacity-60">✕</span>
          </button>
        ))}
      </div>
    </div>
  )
}
