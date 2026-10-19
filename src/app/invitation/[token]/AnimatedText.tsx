import { Fragment } from 'react'

export default function AnimatedText({
  text,
  startDelay = 0,
  step = 0.08,
}: {
  text: string
  startDelay?: number
  step?: number
}) {
  let index = 0
  const words = text.split(' ')

  return (
    <span aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span aria-hidden="true" className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, i) => {
              const delay = startDelay + index++ * step
              return (
                <span
                  key={i}
                  className="letter-rise"
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