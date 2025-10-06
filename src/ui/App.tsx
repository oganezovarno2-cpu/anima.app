// src/ui/App.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

import ChatList, { loadChats, saveChats, type ChatMeta } from "./ChatList";
import ChatView from "./ChatView";
import WheelPicker from "./WheelPicker";
import StepDots from "./StepDots";
import MoodFace from "./MoodFace";

import { t, getLang, setLang, topicsFor, type Lang } from "../lib/i18n";

// ===== helpers =====
type Route = "splash" | "age" | "name" | "topics" | "mood" | "chat";
type Profile = { age?: number; name?: string; topics?: string[]; mood?: string };

const uid = () => Math.random().toString(36).slice(2, 10);

// ===== Header =====
function Header() {
  const [lang, setL] = React.useState<Lang>(getLang());
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value as Lang;
    setLang(v); setL(v); location.reload();
  }
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/30 border-b border-black/5">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <img src="/logo.svg" alt="Anima" className="w-8 h-8 rounded-full shadow-glow" />
        <div className="flex-1">
          <h1 className="text-sm font-semibold tracking-wide">Anima</h1>
          <p className="text-xs opacity-70 -mt-0.5">{t("appTag")}</p>
        </div>
        <select value={lang} onChange={onChange} className="text-xs px-2 py-1 rounded-full bg-white/70 shadow border">
          <option value="en">EN</option>
          <option value="ru">RU</option>
          <option value="es">ES</option>
        </select>
      </div>
    </header>
  );
}

// ===== Card (анимации и «стекло») =====
function Card({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.98 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="rounded-[28px] p-6 bg-white/50 shadow-glow border border-black/5 backdrop-blur text-center glass"
    >
      {children}
      {footer && <div className="mt-5">{footer}</div>}
    </motion.div>
  );
}

// ===== экран 0: приветствие =====
function Splash({ onNext }: { onNext: () => void }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card
        footer={
          <button onClick={onNext} className="w-full py-3 rounded-2xl btn-grad text-white">
            {t("continue")}
          </button>
        }
      >
        <motion.img
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          src="/illus/hero.svg"
          alt="hero"
          className="h-72 w-full object-cover rounded-3xl"
        />
        <div className="mt-4 text-sm opacity-80">{t("talk_sub")}</div>
        <div className="mt-4 flex justify-center">
          <StepDots active={0} total={4} />
        </div>
      </Card>
    </div>
  );
}

// ===== экран 1: возраст (крутилка) =====
function AgeScreen({ onNext }: { onNext: (age: number) => void }) {
  const ages = Array.from({ length: 61 }, (_, i) => 12 + i); // 12..72
  const [val, setVal] = React.useState(18);
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card
        footer={
          <>
            <div className="mb-3 flex justify-center">
              <StepDots active={1} total={4} />
            </div>
            <button onClick={() => onNext(val)} className="w-full py-3 rounded-2xl btn-grad text-white">
              {t("continue")}
            </button>
          </>
        }
      >
        <h2 className="text-2xl font-semibold mb-4">{t("How old are you?") || "How old are you?"}</h2>
        <WheelPicker
          values={ages.map(String)}
          value={String(val)}
          onChange={(v) => setVal(parseInt(v))}
        />
      </Card>
    </div>
  );
}

// ===== экран 2: имя =====
function NameScreen({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = React.useState("");
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card
        footer={
          <>
            <div className="mb-3 flex justify-center">
              <StepDots active={2} total={4} />
            </div>
            <button onClick={() => onNext(name)} className="w-full py-3 rounded-2xl btn-grad text-white">
              {t("continue")}
            </button>
          </>
        }
      >
        <h2 className="text-2xl font-semibold mb-3">{t("name_title")}</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("name_placeholder")}
          className="w-full px-3 py-3 rounded-2xl bg-white/80 border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        <p className="text-xs opacity-70 mt-2">{t("name_hint")}</p>
      </Card>
    </div>
  );
}

// ===== экран 3: интересы =====
function TopicsScreen({ onNext }: { onNext: (sel: string[]) => void }) {
  const all = topicsFor(getLang());
  const [sel, setSel] = React.useState<string[]>([]);
  function togg(t: string) {
    setSel((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  }
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card
        footer={
          <>
            <div className="mb-3 flex justify-center">
              <StepDots active={3} total={4} />
            </div>
            <button onClick={() => onNext(sel)} className="w-full py-3 rounded-2xl btn-grad text-white">
              {t("continue")}
            </button>
          </>
        }
      >
        <h2 className="text-xl font-semibold mb-3">{t("topics_title")}</h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {all.map((x) => (
            <button
              key={x}
              onClick={() => togg(x)}
              className={`px-3 py-1 rounded-2xl border ${
                sel.includes(x) ? "bg-black text-white" : "bg-white/80 border-black/10"
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ===== экран 4: настроение =====
function MoodScreen({ onNext }: { onNext: (mood: string) => void }) {
  const [v, setV] = React.useState(50);
  let label = t("mood_mid");
  if (v < 33) label = t("mood_bad");
  if (v >= 66) label = t("mood_good");
  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card
        footer={
          <button onClick={() => onNext(label)} className="w-full py-3 rounded-2xl btn-grad text-white">
            {t("continue")}
          </button>
        }
      >
        <h2 className="text-xl font-semibold mb-2">{t("mood_title")}</h2>
        <div className="mb-4">
          <MoodFace value={v} />
        </div>
        <div className="text-sm font-semibold mb-2 text-black/80">{label}</div>
        <input
          type="range"
          min={0}
          max={100}
          value={v}
          onChange={(e) => setV(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1 opacity-70">
          <span>{t("mood_bad")}</span>
          <span>{t("mood_mid")}</span>
          <span>{t("mood_good")}</span>
        </div>
      </Card>
    </div>
  );
}

// ===== основной App =====
export default function App() {
  // загрузка/создание первого чата
  const [chatId, setChatId] = React.useState<string>(() => {
    const list = loadChats();
    if (list.length) return list[0].id;
    const c = { id: uid(), title: "General", created: Date.now() } as ChatMeta;
    saveChats([c]);
    return c.id;
  });

  // онбординг
  const [route, setRoute] = React.useState<Route>(() => {
    const done = localStorage.getItem("anima-onb-done") === "1";
    return done ? "chat" : "splash";
  });
  const [profile, setProfile] = React.useState<Profile>(() => {
    try { return JSON.parse(localStorage.getItem("anima-onb") || "{}"); } catch { return {}; }
  });

  function saveProfile(p: Profile) {
    setProfile(p);
    localStorage.setItem("anima-onb", JSON.stringify(p));
  }
  function finishOnb() {
    localStorage.setItem("anima-onb-done", "1");
    setRoute("chat");
  }

  return (
    <div className="min-h-full flex flex-col">
      <Header />

      {/* Сайдбар чатов + основная область */}
      <div className="max-w-6xl mx-auto w-full px-4 py-4 grid gap-4"
           style={{ gridTemplateColumns: "280px 1fr" }}>
        {/* список чатов (как в ChatGPT слева) */}
        <div className="hidden md:block">
          <ChatList
            current={chatId}
            onSelect={setChatId}
            onCreate={() => {
              const title = prompt("Chat title")?.trim() || `Chat ${new Date().toLocaleTimeString()}`;
              const list = loadChats();
              const c = { id: uid(), title, created: Date.now() } as ChatMeta;
              saveChats([c, ...list]);
              setChatId(c.id);
            }}
            onDelete={(idDel) => {
              const rest = loadChats().filter((c) => c.id !== idDel);
              saveChats(rest);
              localStorage.removeItem(`anima-chat-${idDel}`);
              if (chatId === idDel && rest.length) setChatId(rest[0].id);
            }}
          />
        </div>

        {/* контент/экраны */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {route === "splash" && (
              <motion.div key="splash"><Splash onNext={() => setRoute("age")} /></motion.div>
            )}
            {route === "age" && (
              <motion.div key="age"><AgeScreen onNext={(age) => { saveProfile({ ...profile, age }); setRoute("name"); }} /></motion.div>
            )}
            {route === "name" && (
              <motion.div key="name"><NameScreen onNext={(name) => { saveProfile({ ...profile, name }); setRoute("topics"); }} /></motion.div>
            )}
            {route === "topics" && (
              <motion.div key="topics"><TopicsScreen onNext={(topics) => { saveProfile({ ...profile, topics }); setRoute("mood"); }} /></motion.div>
            )}
            {route === "mood" && (
              <motion.div key="mood"><MoodScreen onNext={(mood) => { saveProfile({ ...profile, mood }); finishOnb(); }} /></motion.div>
            )}
            {route === "chat" && (
              <motion.div key="chat" className="min-h-[70vh] rounded-[28px] bg-white/40 shadow-glow border border-black/5 backdrop-blur">
                {/* сам чат с ИИ — НОВЫЙ компонент */}
                <ChatView chatId={chatId} name={profile?.name} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="text-center text-xs opacity-70 py-6">
        {t("footer", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}

