'use client'

import { Fragment, useEffect, useRef, useState } from 'react'

export default function AnimatedText({
  text,
  startDelay = 0,
  step = 0.08,
}: {
  text: string
  startDelay?: number
  step?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  let index = 0
  const words = text.split(' ')

  return (
    <span ref={ref} aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, i) => {
              const delay = startDelay + index++ * step
              return (
                <span
                  key={i}
                  className={`letter-rise ${visible ? 'is-visible' : ''}`}
                  style={{ animationDelay: `${delay}s` }}
                >
                  {ch}
                </span>
              )
            })}
          </span>
          {w < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}