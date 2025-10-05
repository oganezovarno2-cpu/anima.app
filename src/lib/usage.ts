// Учет времени разговоров суммарно по всем чатам (анти-обман)
const DAILY_LIMIT_MS = 15 * 60 * 1000 // 15 минут
const PREFIX = 'anima-usage-'

function todayKey() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth()+1).padStart(2,'0')
  const dd = String(d.getDate()).padStart(2,'0')
  return `${PREFIX}${yyyy}-${mm}-${dd}`
}

export function getUsedMsToday(): number {
  const v = localStorage.getItem(todayKey())
  return v ? Number(v) : 0
}

export function addUsedMs(ms: number) {
  const cur = getUsedMsToday()
  localStorage.setItem(todayKey(), String(cur + ms))
}

export function isLockedToday(): boolean {
  return getUsedMsToday() >= DAILY_LIMIT_MS
}

let sessionStart: number | null = null
let tick: number | null = null

export function startSession() {
  if (isLockedToday()) return
  if (sessionStart) return
  sessionStart = Date.now()
  tick = window.setInterval(() => {
    if (!sessionStart) return
    const ms = Date.now() - sessionStart
    sessionStart = Date.now()
    addUsedMs(ms)
    if (isLockedToday()) stopSession()
  }, 1000)
}

export function stopSession() {
  if (!sessionStart) return
  const ms = Date.now() - sessionStart
  addUsedMs(ms)
  sessionStart = null
  if (tick) { clearInterval(tick); tick = null }
}

export function remainingMsToday(): number {
  return Math.max(0, DAILY_LIMIT_MS - getUsedMsToday())
}

export function formatMmSs(ms:number) {
  const s = Math.floor(ms/1000)
  const m = Math.floor(s/60)
  const sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}
