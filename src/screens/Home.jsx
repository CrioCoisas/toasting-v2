import { useRef, useState } from 'react'
import { AnimatePresence, motion, animate, useMotionValue, useTransform, useReducedMotion } from 'framer-motion'
import { QrIcon } from '../components/icons'
import { VENUES } from '../data/venues'
import './Home.css'

function haptic(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern)
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const N = VENUES.length
const mod = (n) => ((n % N) + N) % N

// ---- Coverflow geometry ----------------------------------------------------
// `pos` is an unbounded continuous index. Each card's signed distance from the
// centre is wrapped into [-N/2, N/2) so the carousel is endless — the wrap seam
// sits at |delta|≈N/2, far outside the visible window (|delta|<=2), so it never
// shows. The centre card is flat and big; neighbours rotate away on Y, shrink,
// recede in Z and dim — the horizontal recreation of the reference stack.
const SPACING = 188 // px between adjacent card centres
const ANGLE = 42 // deg of Y-rotation for a one-step neighbour
const SCALE_DROP = 0.18 // how much smaller each step out is
const DEPTH = -90 // translateZ per step (needs perspective on the stage)

const wrapDelta = (d) => {
  let x = ((d % N) + N) % N
  if (x > N / 2) x -= N
  return x
}
const xOf = (d) => clamp(d, -2, 2) * SPACING
const rotOf = (d) => clamp(d, -2, 2) * -ANGLE
const scaleOf = (d) => 1 - Math.min(Math.abs(d), 2) * SCALE_DROP
const zOf = (d) => Math.min(Math.abs(d), 2) * DEPTH
const opacityOf = (d) => clamp(1.7 - Math.abs(d) * 0.7, 0, 1)
const zIndexOf = (d) => Math.round(50 - Math.abs(d) * 10)
// Exact Figma card shadow (two soft layers of --ink @ 8%); static so it stays
// clean instead of smearing with the 3D rotation. Off-centre cards dim a hair.
const SHADOW = 'drop-shadow(0 2px 8px rgba(14,13,7,0.08)) drop-shadow(0 1px 2px rgba(14,13,7,0.08))'
const filterOf = (d) => `brightness(${1 - Math.min(Math.abs(d), 1) * 0.06}) ${SHADOW}`

function VoucherCard({ venue }) {
  return (
    <div className="vcard" style={{ backgroundColor: venue.bg, color: venue.ink }}>
      <div className="vcard__top">
        <span
          className="vcard__logo"
          style={{ '--logo': `url(${venue.logo})` }}
          role="img"
          aria-label={venue.name}
        />
        <div className="vcard__field">
          <span className="vcard__label">{venue.label}</span>
          <span className="vcard__name">{venue.name}</span>
        </div>
      </div>
      <div className="vcard__perf" aria-hidden="true" />
      <div className="vcard__bottom">
        <div className="vcard__field">
          <span className="vcard__label">HORÁRIO</span>
          <div className="vcard__hours">
            {venue.hours.map(([day, time]) => (
              <div className="vcard__hourrow" key={day}>
                <span className="vcard__day">{day}</span>
                <span>{time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="vcard__field">
          <span className="vcard__label">ENDEREÇO</span>
          <div className="vcard__addr">
            {venue.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CoverflowCard({ venue, index, pos }) {
  const d = (p) => wrapDelta(index - p)
  const x = useTransform(pos, (p) => xOf(d(p)))
  const z = useTransform(pos, (p) => zOf(d(p)))
  const rotateY = useTransform(pos, (p) => rotOf(d(p)))
  const scale = useTransform(pos, (p) => scaleOf(d(p)))
  const opacity = useTransform(pos, (p) => opacityOf(d(p)))
  const zIndex = useTransform(pos, (p) => zIndexOf(d(p)))
  const filter = useTransform(pos, (p) => filterOf(d(p)))
  return (
    <motion.div className="home__card" style={{ x, z, rotateY, scale, opacity, zIndex, filter }}>
      <VoucherCard venue={venue} />
    </motion.div>
  )
}

export default function Home() {
  const reduce = useReducedMotion()
  const pos = useMotionValue(0)
  const [active, setActive] = useState(0)
  const drag = useRef(null)

  // target is an unbounded index; the carousel animates the short way and the
  // indicator shows its wrapped position. A short tick fires whenever the
  // selected voucher actually changes (swipe or dot tap).
  const snapTo = (target) => {
    const next = mod(target)
    if (next !== active) haptic(10)
    setActive(next)
    if (reduce) pos.set(target)
    else animate(pos, target, { type: 'spring', stiffness: 250, damping: 34, restDelta: 0.0008 })
  }

  const onDown = (e) => {
    drag.current = { x0: e.clientX, p0: pos.get(), vx: 0, lx: e.clientX, lt: performance.now() }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    const g = drag.current
    if (!g) return
    const now = performance.now()
    const dt = now - g.lt
    if (dt > 0) {
      g.vx = (e.clientX - g.lx) / dt
      g.lx = e.clientX
      g.lt = now
    }
    pos.set(g.p0 - (e.clientX - g.x0) / SPACING)
  }
  const onUp = () => {
    const g = drag.current
    if (!g) return
    drag.current = null
    // Steps are decided by drag distance OR a flick — never both added together
    // (that double-counting let a single swipe jump two cards). A drag past the
    // halfway point commits that many cards; a short fast flick advances one.
    const start = Math.round(g.p0)
    const moved = pos.get() - g.p0 // signed cards dragged
    const flick = -(g.vx * 140) / SPACING // signed cards of momentum
    let step = 0
    if (Math.abs(moved) >= 0.5) step = Math.round(moved)
    else if (Math.abs(flick) >= 0.5) step = Math.sign(flick)
    const target = start + step
    snapTo(target)
  }

  // Pick the copy of card `i` nearest the current position so dot taps take the
  // short path around the loop.
  const goTo = (i) => {
    const cur = pos.get()
    snapTo(i + Math.round((cur - i) / N) * N)
  }

  return (
    <motion.main
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="home__top">
        <h1 className="home__title">
          Gerenciar
          <span>Seus Vales</span>
        </h1>
        <div className="home__avatar" aria-hidden="true" />
      </header>

      <div
        className="home__carousel"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="group"
        aria-label="Seus vales — arraste para o lado"
      >
        <div className="home__stage">
          {VENUES.map((venue, i) => (
            <CoverflowCard key={venue.id} venue={venue} index={i} pos={pos} />
          ))}
        </div>
      </div>

      <div className="home__dots" role="tablist" aria-label="Vale selecionado">
        {VENUES.map((v, i) => (
          <button
            key={v.id}
            type="button"
            className={'home__dot' + (i === active ? ' is-active' : '')}
            aria-label={v.name}
            aria-selected={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <div className="home__footer">
        <div className="home__promo">
          <p className="home__promo-eyebrow">PARA TODA A MESA</p>
          <p className="home__promo-value">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={VENUES[active].discount}
                className="home__promo-num"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                {VENUES[active].discount}%
              </motion.span>
            </AnimatePresence>{' '}
            OFF
          </p>
        </div>
        <button type="button" className="home__cta">
          <QrIcon size={20} />
          Gerar QRCode
        </button>
      </div>
    </motion.main>
  )
}
