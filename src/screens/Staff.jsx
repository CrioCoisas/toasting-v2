import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDownIcon } from '../components/icons'
import { VENUES } from '../data/venues'
import './Staff.css'

function haptic(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

const enter = (reduce) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: reduce ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] },
})

// Step dots: active step is a 24px bar (its position morphs between the two
// staff screens via the shared layoutId), the other is a 4px dot at 40%.
function Steps({ step, reduce }) {
  return (
    <div className="staff__steps" role="group" aria-label={`Etapa ${step} de 2`}>
      {[1, 2].map((n) => {
        const active = n === step
        if (active && !reduce) {
          return (
            <motion.span
              key="active"
              layoutId="staff-step-bar"
              className="staff__step is-active"
              transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            />
          )
        }
        return <span key={n} className={'staff__step' + (active ? ' is-active' : '')} />
      })}
    </div>
  )
}

// Step 1 — collect the house, name and team code.
export function StaffData({ onContinue }) {
  const reduce = useReducedMotion()
  const [casa, setCasa] = useState('')
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')

  const venue = VENUES.find((v) => v.id === casa)
  const valid = casa && nome.trim() && codigo.trim()

  const submit = (e) => {
    e.preventDefault()
    if (!valid) {
      haptic(8)
      return
    }
    haptic([8, 40, 12])
    onContinue?.()
  }

  return (
    <motion.main className="staff" {...enter(reduce)}>
      <form className="staff__inner" onSubmit={submit}>
        <div className="staff__top">
          <Steps step={1} reduce={reduce} />
          <header className="staff__head">
            <p className="staff__eyebrow">Espera aí ,</p>
            <h1 className="staff__title">Vamos identificar você</h1>
          </header>
        </div>

        <div className="staff__fields">
          <div className="staff__field">
            <p className="staff__label">Casa</p>
            <div className="staff__pill staff__pill--select">
              {venue ? (
                <span className="staff__casa-val">
                  <span>{venue.name}</span>
                  <span className="staff__casa-sep" />
                  <span className="staff__casa-hood">{venue.neighborhood.split(',')[0]}</span>
                </span>
              ) : (
                <span className="staff__casa-val staff__casa-placeholder">Escolha a casa</span>
              )}
              <ChevronDownIcon size={24} />
              <select
                className="staff__select"
                value={casa}
                onChange={(e) => setCasa(e.target.value)}
                aria-label="Casa"
              >
                <option value="" disabled>
                  Escolha a casa
                </option>
                {VENUES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="staff__field">
            <p className="staff__label">Nome e sobrenome</p>
            <div className="staff__pill">
              <input
                className="staff__input"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Informe seu nome"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                aria-label="Nome e sobrenome"
              />
            </div>
          </div>

          <div className="staff__field staff__field--code">
            <div className="staff__field">
              <p className="staff__label">Código</p>
              <div className="staff__pill">
                <input
                  className="staff__input"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="EQUIPE-7120"
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  aria-label="Código"
                />
              </div>
            </div>
            <p className="staff__helper">
              Use o código de equipe da sua casa. O benefício vale enquanto você for funcionário
              ativo.
            </p>
          </div>
        </div>

        <button type="submit" className={'staff__cta' + (valid ? '' : ' is-disabled')} aria-disabled={!valid}>
          Continuar
        </button>
      </form>
    </motion.main>
  )
}

// Step 2 — 6-digit code, split 3 · dash · 3.
export function StaffCode({ onSubmit, onResend }) {
  const reduce = useReducedMotion()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const refs = useRef([])

  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus(), reduce ? 0 : 350)
    return () => clearTimeout(t)
  }, [reduce])

  const valid = code.every(Boolean)

  const setDigit = (i, val) => {
    const d = val.replace(/\D/g, '').slice(-1)
    setCode((c) => c.map((x, j) => (j === i ? d : x)))
    if (d && i < 5) refs.current[i + 1]?.focus()
  }

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const submit = (e) => {
    e.preventDefault()
    if (!valid) {
      haptic(8)
      return
    }
    haptic([8, 40, 12])
    onSubmit?.(code.join(''))
  }

  const box = (i) => (
    <label className="staff__otp-box" key={i}>
      <input
        ref={(el) => (refs.current[i] = el)}
        className="staff__otp-input"
        value={code[i]}
        onChange={(e) => setDigit(i, e.target.value)}
        onKeyDown={(e) => onKeyDown(i, e)}
        inputMode="numeric"
        maxLength={1}
        aria-label={`Dígito ${i + 1}`}
      />
      {!code[i] && <span className="staff__otp-dot" />}
    </label>
  )

  return (
    <motion.main className="staff" {...enter(reduce)}>
      <form className="staff__inner" onSubmit={submit}>
        <div className="staff__top">
          <Steps step={2} reduce={reduce} />
          <header className="staff__head">
            <p className="staff__eyebrow">Confere o email e</p>
            <h1 className="staff__title">Digite o código</h1>
          </header>
        </div>

        <div className="staff__code-wrap">
          <div className="staff__otp-group">
            <div className="staff__otp-row">
              <div className="staff__otp-triplet">{[0, 1, 2].map(box)}</div>
              <span className="staff__otp-dash" />
              <div className="staff__otp-triplet">{[3, 4, 5].map(box)}</div>
            </div>
            <p className="staff__resend">
              <span className="staff__resend-q">Não chegou?</span>
              <button type="button" className="staff__resend-a" onClick={onResend}>
                Reenviar código
              </button>
            </p>
          </div>
        </div>

        <button type="submit" className={'staff__cta' + (valid ? '' : ' is-disabled')} aria-disabled={!valid}>
          Entrar
        </button>
      </form>
    </motion.main>
  )
}
