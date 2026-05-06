import { useState, useEffect, useRef } from 'react'

export function useTypingAnimation(text, speed = 30) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!text) {
      setDisplayText('')
      indexRef.current = 0
      return
    }

    setIsTyping(true)
    indexRef.current = 0
    setDisplayText('')

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.substring(0, indexRef.current + 1))
        indexRef.current++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return { displayText, isTyping }
}
