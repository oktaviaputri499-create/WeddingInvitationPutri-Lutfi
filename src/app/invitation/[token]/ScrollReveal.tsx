'use client'

import { Fragment, useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  className?: string
  // Replays the content inside (e.g. letter-by-letter text) every time the section
  // comes back into view. Don't use it on sections with forms, or whatever the
  // guest has typed would be cleared.
  replay?: boolean
}

export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
  replay = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [round, setRound] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) setRound((r) => r + 1)
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 duration-1000'
          : 'opacity-0 translate-y-10 duration-500'
      } ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      <Fragment key={replay ? round : 0}>{children}</Fragment>
    </div>
  )
}