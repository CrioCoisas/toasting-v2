import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BackIcon } from '../components/icons'
import './Onboard.css'

function haptic(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

const PILL_PAD_X = 20 // keep in sync with .onboard__pill padding
const SCROLL_PAD = 8 // room so the caret / last glyph clears the rounded edge

// Shared onboarding prompt: step bar + eyebrow + question, one self-sizing pill
// input, and a back + "Continuar" row. The /name and /email screens are this
// with different copy and validation.
export default function Onboard({
  label,
  eyebrow,
  title,
  placeholder,
  value,
  onChange,
  onContinue,
  onBack,
  type = 'text',
  inputMode = 'text',
  autoComplete,
  autoCapitalize = 'sentences',
  enterKeyHint = 'next',
  isValid,
  step = 1,
  steps = 2,
}) {
  const reduce = useReducedMotion()
  const inputRef = useRef(null)
  const sizerRef = useRef(null)
  const entryRef = useRef(null)
  const [width, setWidth] = useState(0)

  const valid = isValid ? isValid(value) : value.trim().length > 0

  // Size the pill to its content, capped to the row. Within the cap the pill
  // grows per keystroke; once capped, the native input scrolls — so while
  // typing you always see the latest characters, and on blur it ellipsises
  // from the start.
  useLayoutEffect(() => {
    const measure = () => {
      const sizer = sizerRef.current
      const entry = entryRef.current
      if (!sizer || !entry) return
      const max = entry.clientWidth - PILL_PAD_X * 2
      setWidth(Math.min(sizer.scrollWidth + SCROLL_PAD, max))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [value, placeholder])

  // Raise the keyboard on arrival (allowed where the browser permits; on iOS
  // the user may need to tap the pill — it's focusable either way).
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), reduce ? 0 : 350)
    return () => clearTimeout(t)
  }, [reduce])

  const submit = (e) => {
    e?.preventDefault()
    if (!valid) {
      haptic(8)
      return
    }
    haptic([8, 40, 12])
    onContinue?.(value.trim())
  }

  return (
    <motion.main
      className="onboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <form className="onboard__inner" onSubmit={submit}>
        <div className="onboard__top">
          <div className="onboard__steps" role="group" aria-label={`Etapa ${step} de ${steps}`}>
            {Array.from({ length: steps }, (_, i) => {
              const active = i + 1 === step
              // The active bar morphs to the next slot across the route change;
              // dots stay plain (they just crossfade with the screen).
              if (active && !reduce) {
                return (
                  <motion.span
                    key="active"
                    layoutId="onboard-step-bar"
                    className="onboard__step is-active"
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                  />
                )
              }
              return <span key={i} className={'onboard__step' + (active ? ' is-active' : '')} />
            })}
          </div>
          <header className="onboard__head">
            <p className="onboard__eyebrow">{eyebrow}</p>
            <h1 className="onboard__title">{title}</h1>
          </header>
        </div>

        <div className="onboard__entry" ref={entryRef}>
          <div className="onboard__pill" onClick={() => inputRef.current?.focus()}>
            <input
              ref={inputRef}
              className="onboard__input"
              style={{ width }}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
              type={type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              autoCapitalize={autoCapitalize}
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint={enterKeyHint}
              aria-label={label}
            />
            {/* Hidden mirror — its measured width drives the pill. */}
            <span ref={sizerRef} className="onboard__sizer" aria-hidden="true">
              {value || placeholder}
            </span>
          </div>
        </div>

        <div className="onboard__actions">
          <button type="button" className="onboard__back" aria-label="Voltar" onClick={onBack}>
            <BackIcon size={24} />
          </button>
          <button
            type="submit"
            className={'onboard__continue' + (valid ? '' : ' is-disabled')}
            aria-disabled={!valid}
          >
            Continuar
          </button>
        </div>
      </form>
    </motion.main>
  )
}
