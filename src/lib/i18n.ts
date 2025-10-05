export type Lang = 'en' | 'ru' | 'es'
const KEY = 'anima-lang'

const dict = {
  en: {
    appName: 'Anima', appTag: 'your gentle friend',
    continue: 'Continue',
    talk_title: 'Talk to an AI Psychologist',
    talk_sub: 'Kind, private, always here to listen.',
    proof_title: 'Anima is already used by 80,000 people',
    name_title: 'How should I address you?',
    name_hint: 'You can change this later.',
    name_placeholder: 'Your name',
    topics_title: 'Choose the topics that are close to you',
    mood_title: 'How is your mood?',
    mood_bad: 'BAD', mood_mid: 'NOT BAD', mood_good: 'GOOD',
    chat_placeholder: 'Write what’s on your mind…',
    send: 'Send',
    footer: '© {year} Anima',
    go_landing: 'Go to landing', back_chat: 'Back to chat',
  },
  ru: {
    appName: 'Anima', appTag: 'твой добрый друг',
    continue: 'Продолжить',
    talk_title: 'Поговори с ИИ-психологом',
    talk_sub: 'Доброжелательно, приватно, всегда рядом.',
    proof_title: 'Anima уже пользуются 80 000 человек',
    name_title: 'Как мне к тебе обращаться?',
    name_hint: 'Это можно изменить позже.',
    name_placeholder: 'Твоё имя',
    topics_title: 'Выбери темы, которые близки тебе',
    mood_title: 'Как твоё настроение?',
    mood_bad: 'ПЛОХО', mood_mid: 'НЕПЛОХО', mood_good: 'ХОРОШО',
    chat_placeholder: 'Напиши, что на душе…',
    send: 'Отправить',
    footer: '© {year} Anima',
    go_landing: 'На лендинг', back_chat: 'Назад в чат',
  },
  es: {
    appName: 'Anima', appTag: 'tu amigo amable',
    continue: 'Continuar',
    talk_title: 'Habla con un psicólogo de IA',
    talk_sub: 'Amable, privado, siempre dispuesto a escuchar.',
    proof_title: 'Anima ya lo usan 80.000 personas',
    name_title: '¿Cómo debería dirigirme a ti?',
    name_hint: 'Puedes cambiarlo más tarde.',
    name_placeholder: 'Tu nombre',
    topics_title: 'Elige los temas que te interesan',
    mood_title: '¿Cómo está tu ánimo?',
    mood_bad: 'MAL', mood_mid: 'NO TAN MAL', mood_good: 'BIEN',
    chat_placeholder: 'Escribe lo que tienes en mente…',
    send: 'Enviar',
    footer: '© {year} Anima',
    go_landing: 'Ir a portada', back_chat: 'Volver al chat',
  }
} as const

export function getLang(): Lang {
  return (localStorage.getItem(KEY) as Lang) || 'en'
}
export function setLang(l: Lang) { localStorage.setItem(KEY, l) }

export function t(key: keyof typeof dict['en'], vars?: Record<string,string|number>) {
  const lang = getLang()
  const table = (dict as any)[lang]
  let s = table[key] ?? key
  if (vars) for (const [k,v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}

export const TOPIC_LIST_EN = ["Anxiety","Motivation","Study","Relationships","Sleep","Confidence","Habits","Work","Money","Family","Sport","Other"]
export const TOPIC_LIST_RU = ["Тревога","Мотивация","Учёба","Отношения","Сон","Уверенность","Привычки","Работа","Деньги","Семья","Спорт","Другое"]
export const TOPIC_LIST_ES = ["Ansiedad","Motivación","Estudio","Relaciones","Sueño","Confianza","Hábitos","Trabajo","Dinero","Familia","Deporte","Otro"]

export function topicsFor(lang: Lang) {
  if (lang==='ru') return TOPIC_LIST_RU
  if (lang==='es') return TOPIC_LIST_ES
  return TOPIC_LIST_EN
}
