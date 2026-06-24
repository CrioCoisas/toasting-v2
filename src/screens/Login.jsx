import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
} from 'framer-motion'
import { MAX_CODE_LENGTH, sanitize, validateCode } from '../data/codes'
import { ArrowIcon, CheckIcon, CloseIcon, PenIcon, UnlockIcon } from '../components/icons'
import './Login.css'

function haptic(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

// Half of (button 48 + gap 8): keep the pill+button group centred. The button
// is always present (until unlocked), so this stays constant — no per-keystroke
// movement; only on unlock does the button leave and the pill glide to centre.
const GROUP_SHIFT = 28

// Error shake, from the transitions.dev spec: 6px out, 6px back, 4px overshoot,
// settle. 80/60/80/60ms = 280ms, each leg on the same soft cubic.
const SHAKE_EASE = [0.22, 1, 0.36, 1]
const SHAKE = {
  x: [0, 6, -6, 4, 0],
  transition: {
    duration: 0.28,
    times: [0, 0.2857, 0.5714, 0.7857, 1],
    ease: [SHAKE_EASE, SHAKE_EASE, SHAKE_EASE, SHAKE_EASE],
  },
}

export default function Login({ onAuthenticated }) {
  const reduce = useReducedMotion()
  const inputRef = useRef(null)
  const shake = useAnimationControls()
  const [code, setCode] = useState('')
  const [focused, setFocused] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState(false)

  const focusInput = () => inputRef.current?.focus()
  const hasCode = code.length > 0

  const onChange = (e) => {
    if (unlocked) return
    if (error) setError(false) // editing clears the error state
    setCode(sanitize(e.target.value))
  }

  const clear = () => {
    setCode('')
    setError(false)
    focusInput()
    haptic(6)
  }

  // Validate only on submit — the action button, Enter (desktop), or the
  // keyboard's "go" (mobile).
  const attempt = () => {
    if (unlocked || !code) return
    const match = validateCode(code)
    if (match) {
      setUnlocked(true)
      setError(false)
      setFocused(false)
      inputRef.current?.blur()
      haptic([10, 50, 16])
      setTimeout(() => onAuthenticated?.(match), 750)
    } else {
      setError(true)
      haptic([12, 60, 12])
      if (!reduce) shake.start(SHAKE)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    attempt()
  }

  // Tap the action button: submit if there's a code, otherwise focus.
  const onActionClick = (e) => {
    e.stopPropagation()
    if (hasCode) attempt()
    else focusInput()
  }

  // Light tick on each accepted character.
  useEffect(() => {
    if (code) haptic(5)
  }, [code.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Error auto-reverts after a hold (matches the spec's revert behaviour).
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(false), 3000)
    return () => clearTimeout(t)
  }, [error])

  const showCaret = focused && !unlocked

  const enter = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10, filter: 'blur(5px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.05 } },
  }

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.55, filter: 'blur(2px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.55, filter: 'blur(2px)' },
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
      }

  const pillClass =
    'pill' +
    (unlocked ? ' pill--ok' : '') +
    (error ? ' pill--error' : '') +
    (focused ? ' pill--typing' : '')

  return (
    <motion.main
      className="login"
      variants={stagger}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <div className="login__main">
        <motion.h1 className="login__headline" variants={enter}>
          Para amigos que
          <br />
          sempre brindam.
        </motion.h1>

        <motion.form className="login__entry" variants={enter} onSubmit={onSubmit}>
          {/* Constant group-centre shift while the button is present; glides to
              0 on unlock. No per-keystroke movement → typing stays stable. */}
          <motion.div
            className="login__shift"
            animate={{ x: unlocked || reduce ? 0 : -GROUP_SHIFT }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div className={pillClass} animate={shake} onClick={focusInput}>
              <span className="field">
                <span className="field__chars" aria-hidden="true">
                  {!hasCode ? (
                    <>
                      {showCaret && <span className="caret caret--lead" />}
                      <span className="char char--placeholder">CODE</span>
                    </>
                  ) : (
                    <>
                      <AnimatePresence initial={false} mode="popLayout">
                        {code.split('').map((ch, i) => (
                          <motion.span
                            key={i}
                            className="char"
                            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 7, filter: 'blur(4px)' }}
                            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.55, filter: 'blur(3px)' }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {ch}
                          </motion.span>
                        ))}
                      </AnimatePresence>
                      {showCaret && <span className="caret" />}
                    </>
                  )}
                </span>

                {/* Real input sits on top, invisible — captures the keyboard */}
                <input
                  ref={inputRef}
                  className="field__input"
                  value={code}
                  onChange={onChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  inputMode="text"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={MAX_CODE_LENGTH}
                  enterKeyHint="go"
                  aria-label="Código de acesso"
                  readOnly={unlocked}
                />
              </span>

              <AnimatePresence mode="popLayout">
                {hasCode && !unlocked && (
                  <motion.button
                    key="clear"
                    type="button"
                    className="pill__clear"
                    aria-label="Limpar"
                    onClick={(e) => {
                      e.stopPropagation()
                      clear()
                    }}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.4, bounce: 0.4 } }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
                  >
                    <CloseIcon size={16} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Persistent action button: pen (focus) ↔ submit arrow (send).
                  Absolute, so it never reflows the pill. Leaves on unlock. */}
              <AnimatePresence initial={false}>
                {!unlocked && (
                  <motion.button
                    key="action"
                    type="button"
                    className="code-action"
                    aria-label={hasCode ? 'Enviar código' : 'Inserir código'}
                    onClick={onActionClick}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.42, bounce: 0.4 } }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={hasCode ? 'go' : 'pen'} className="code-action__icon" {...swap}>
                        {hasCode ? <ArrowIcon size={20} /> : <PenIcon size={20} />}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.form>
      </div>

      <motion.div className="login__foot" variants={enter}>
        <motion.div
          className={'status' + (unlocked ? ' status--ok' : '')}
          animate={
            unlocked && !reduce
              ? { scale: [1, 1.06, 1], transition: { duration: 0.4, ease: 'easeOut' } }
              : {}
          }
          aria-live="polite"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={unlocked ? 'ok' : 'blocked'}
              className="status__inner"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {unlocked ? 'Acesso liberado' : 'Acesso bloqueado'}
              {unlocked ? <CheckIcon size={20} /> : <UnlockIcon size={20} />}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <div className="login__helper" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={error ? 'err' : 'help'}
              className={'login__helper-text' + (error ? ' login__helper-text--error' : '')}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: 'blur(3px)' }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(3px)' }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {error ? 'Código incorreto. Tente novamente.' : 'Solicite o código ao anfitrião do clube'}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.main>
  )
}
