import React from 'react'

export default function StreamingText({ text, speed=18 }:{ text:string; speed?:number }) {
  const [shown, setShown] = React.useState('')

  React.useEffect(() => {
    let i = 0
    setShown('')
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, Math.max(6, Math.min(60, 1000/Math.max(6, speed))))
    return () => clearInterval(id)
  }, [text, speed])

  return <span>{shown}</span>
}
