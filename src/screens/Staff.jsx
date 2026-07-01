import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { ChevronDownIcon, StarIcon, ForkSpoonIcon, SaleIcon, DishCoverIcon } from '../components/icons'
import { VENUES } from '../data/venues'
import qrSrc from '../assets/qr.svg'
import cardMark from '../assets/staff/card-mark.svg'
import photoMark from '../assets/staff/photo-mark.svg'
import avatarCard from '../assets/staff/avatar-card.png'
import avatarMini from '../assets/staff/avatar-mini.png'
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

// Mocked account until there's a real DB. Every field here comes from the
// account; `id` also seeds the watermark placement so each member's card looks
// unique. TODO(db): fetch this per authenticated staff member.
const ACCOUNT = {
  id: 'john-doe-mat-00318',
  name: 'John Doe',
  role: 'Garçom',
  base: 'Base Dainer',
  matricula: 'MAT-00318',
  since: 'MAR.2024',
  discount: '30% OFF',
  status: 'ATIVO',
}

// The big Toasting logo is placed differently on every card, seeded from the
// account id, so no two members' cards look the same. Ranges keep it on-card
// and therefore visible. TODO(db): the seed is the real account id.
function markStyle(seed) {
  let h = 7
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const x = 25 + (h % 55) // 25–80%
  const y = 15 + ((h >> 3) % 55) // 15–70%
  const rot = (h % 70) - 35 // -35°..+35°
  return { left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) rotate(${rot}deg)` }
}

// Staff perk is a flat 30% across the whole group (mock). TODO(db): per-account.
const STAFF_DISCOUNT = '30% OFF'

// The group's casas = the venues under the company. TODO(db): fetch the real
// group roster; here we reuse the seeded venue data.
const GROUP_CASAS = VENUES.map((v) => ({
  id: v.id,
  name: v.name,
  logo: v.logo,
  kind: v.kind,
  hood: v.neighborhood.replace('Rio de Janeiro', 'RJ'),
}))

function CasaCard({ casa, onClick }) {
  return (
    <button type="button" className="casacard" onClick={onClick}>
      <div className="casacard__top">
        <span className="casacard__logo" style={{ '--logo': `url(${casa.logo})` }} role="img" aria-label={casa.name} />
        <span className="casacard__badge">{STAFF_DISCOUNT}</span>
      </div>
      <div className="casacard__meta">
        <p className="casacard__name">{casa.name}</p>
        <div className="casacard__line" />
        <div className="casacard__sub">
          <span className="casacard__kind">{casa.kind}</span>
          <span className="casacard__sep" />
          <span className="casacard__hood">{casa.hood}</span>
        </div>
      </div>
    </button>
  )
}

// Scrollable group list. The edge fades/blurs auto-hide at the very top and
// bottom so the first and last cards are always fully visible (not veiled).
function CasasList({ onSelect }) {
  const ref = useRef(null)
  const [edge, setEdge] = useState({ top: true, bottom: false })

  const update = () => {
    const el = ref.current
    if (!el) return
    setEdge({
      top: el.scrollTop <= 1,
      bottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
    })
  }

  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const hid = (on) => (on ? ' is-hidden' : '')

  return (
    <div className="casas">
      <div className="casas__scroll" ref={ref} onScroll={update}>
        {GROUP_CASAS.map((casa) => (
          <CasaCard key={casa.id} casa={casa} onClick={() => onSelect(casa.id)} />
        ))}
      </div>
      <div className={'casas__blur casas__blur--top' + hid(edge.top)} aria-hidden="true" />
      <div className={'casas__blur casas__blur--bottom' + hid(edge.bottom)} aria-hidden="true" />
      <div className={'casas__fade casas__fade--top' + hid(edge.top)} aria-hidden="true" />
      <div className={'casas__fade casas__fade--bottom' + hid(edge.bottom)} aria-hidden="true" />
    </div>
  )
}

// Staff home — a segmented control switching between the membership card
// ("Carteirinha") and the group's houses ("Casas"). The nav stays mounted so
// the highlight pill and its icon animate; the views crossfade underneath.
export function StaffHome({ onOpenCasa }) {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState('carteirinha')

  const TABS = [
    { id: 'carteirinha', label: 'Carteirinha', Icon: SaleIcon },
    { id: 'casas', label: 'Casas', Icon: DishCoverIcon },
  ]

  const view = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 8 },
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      }

  return (
    <motion.main className="staff staffhome" {...enter(reduce)}>
      <AnimatePresence mode="wait" initial={false}>
        {tab === 'carteirinha' ? (
          <motion.div key="carteirinha" className="staffhome__view" {...view}>
            <header className="staffhome__header">
              <h1 className="staffhome__title">
                Sua
                <br />
                <span className="staffhome__title-2">Carteirinha</span>
              </h1>
              <img className="staffhome__avatar" src={avatarMini} alt="" width={48} height={48} />
            </header>

            <div className="staffhome__card-group">
              <div className="card">
                <img className="card__mark" src={cardMark} alt="" style={markStyle(ACCOUNT.id)} />
                <div className="card__inner">
                  <div className="card__top">
                    <div className="card__photo">
                      <img className="card__photo-img" src={avatarCard} alt="" />
                      <img className="card__photo-mark" src={photoMark} alt="" />
                    </div>
                    <div className="card__id">
                      <div className="card__id-head">
                        <span className="card__equipe">EQUIPE</span>
                        <span className="card__status">
                          <StarIcon size={14} />
                          {ACCOUNT.status}
                        </span>
                      </div>
                      <div className="card__id-name">
                        <p className="card__name">{ACCOUNT.name}</p>
                        <p className="card__role">
                          <span>{ACCOUNT.role}</span>
                          <span className="card__role-sep" />
                          <span className="card__base">{ACCOUNT.base}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card__line" />

                  <div className="card__meta">
                    <div className="card__meta-col">
                      <span className="card__meta-label">MATRÍCULA</span>
                      <span className="card__meta-val">{ACCOUNT.matricula}</span>
                    </div>
                    <div className="card__meta-col">
                      <span className="card__meta-label">FUNCIONÁRIO DESDE</span>
                      <span className="card__meta-val">{ACCOUNT.since}</span>
                    </div>
                  </div>

                  <div className="card__line" />

                  <div className="card__discount">
                    <p className="card__discount-val">{ACCOUNT.discount}</p>
                    <p className="card__discount-sub">EM TODAS CASAS DO GRUPO</p>
                  </div>
                </div>
              </div>

              <div className="staffhome__action">
                <button type="button" className="staffhome__use" onClick={() => setTab('casas')}>
                  <ForkSpoonIcon size={24} />
                  Usar em uma casa
                </button>
                <p className="staffhome__hint">
                  Mostre sua carteirinha no balcão para validar o desconto.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="casas" className="staffhome__view" {...view}>
            <header className="staffhome__header">
              <h1 className="staffhome__title">
                Casas do
                <br />
                <span className="staffhome__title-2">Grupo</span>
              </h1>
              <img className="staffhome__avatar" src={avatarMini} alt="" width={48} height={48} />
            </header>

            <CasasList onSelect={onOpenCasa} />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="staffnav">
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              type="button"
              className={'staffnav__tab' + (active ? ' is-active' : '')}
              onClick={() => setTab(t.id)}
            >
              {active && (
                <motion.span
                  layoutId="staffnav-pill"
                  className="staffnav__pill"
                  transition={
                    reduce ? { duration: 0 } : { type: 'spring', duration: 0.5, bounce: 0.18 }
                  }
                />
              )}
              <span className="staffnav__label">
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span
                      key="icon"
                      className="staffnav__icon"
                      initial={reduce ? false : { width: 0, marginRight: 0, opacity: 0 }}
                      animate={{ width: 24, marginRight: 8, opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { width: 0, marginRight: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.45, bounce: 0.2 }}
                    >
                      <t.Icon size={24} />
                    </motion.span>
                  )}
                </AnimatePresence>
                {t.label}
              </span>
            </button>
          )
        })}
      </nav>
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

// Staff QR — the carteirinha as a scannable ticket for the balcão to validate.
// Shows the casa the member picked from the list. TODO(db): real per-member QR.
export function StaffQr({ onDone }) {
  const reduce = useReducedMotion()
  const { id } = useParams()
  const venue = VENUES.find((v) => v.id === id) ?? VENUES[0]

  return (
    <motion.main className="staff staffqr" {...enter(reduce)}>
      <div className="staffqr__body">
        <div className="staffqr__ticket">
          <div className="staffqr__head">
            <span className="staffqr__logo" style={{ '--logo': `url(${venue.logo})` }} role="img" aria-label={venue.name} />
            <div className="staffqr__row">
              <span className="staffqr__place">{venue.neighborhood}</span>
              <span className="staffqr__off">{STAFF_DISCOUNT}</span>
            </div>
          </div>

          <div className="staffqr__perf" aria-hidden="true" />

          <div className="staffqr__code">
            <img className="staffqr__img" src={qrSrc} alt="QR Code da sua carteirinha" />
            <div className="staffqr__row">
              <span className="staffqr__place">Matrícula</span>
              <span className="staffqr__mat">{ACCOUNT.matricula}</span>
            </div>
          </div>
        </div>

        <p className="staffqr__hint">
          O funcionário do balcão valida sua carteirinha e aplica os 30% na conta.
        </p>
      </div>

      <button type="button" className="staff__cta" onClick={onDone}>
        Concluir
      </button>
    </motion.main>
  )
}
