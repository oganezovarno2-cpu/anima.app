import React from 'react'
export default function TypingDots() {
  return (
    <span className="inline-flex gap-1 align-middle">
      <span className="w-2 h-2 rounded-full bg-black/50 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2 h-2 rounded-full bg-black/50 animate-bounce [animation-delay:-0.1s]"></span>
      <span className="w-2 h-2 rounded-full bg-black/50 animate-bounce"></span>
    </span>
  )
}
