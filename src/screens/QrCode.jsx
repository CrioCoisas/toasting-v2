import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { ClockIcon } from '../components/icons'
import { VENUES } from '../data/venues'
import { pageFade } from '../motion'
import qrSrc from '../assets/qr.svg'
import './Voucher.css'

const VALID_SECONDS = 5 * 60 // QR is valid for 5 minutes

function haptic(p) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(p)
}

export default function QrCode() {
  const { id } = useParams()
  const venue = VENUES.find((v) => v.id === id) ?? VENUES[0]

  const [revealed, setRevealed] = useState(false)
  const [left, setLeft] = useState(VALID_SECONDS)
  const [cycle, setCycle] = useState(0) // bumps to (re)start the countdown
  const expiry = useRef(0)

  // Countdown only runs once the QR is revealed; it ticks off a real expiry
  // timestamp so it stays accurate if the tab is backgrounded. Re-runs on renew.
  useEffect(() => {
    if (!revealed) return
    expiry.current = Date.now() + VALID_SECONDS * 1000
    const tick = () => setLeft(Math.max(0, Math.round((expiry.current - Date.now()) / 1000)))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [revealed, cycle])

  const expired = revealed && left === 0

  const reveal = () => {
    haptic(10)
    setRevealed(true)
  }

  const renew = () => {
    haptic(10)
    setLeft(VALID_SECONDS)
    setCycle((c) => c + 1)
  }

  return (
    <motion.main className="voucher" {...pageFade}>
      <div className="voucher__body">
        <div className="qr">
          <div className="qr__head">
            <span className="qr__logo" style={{ '--logo': `url(${venue.logo})` }} role="img" aria-label={venue.name} />
            <span className="qr__place">{venue.address[venue.address.length - 1]}</span>
          </div>
          <div className="qr__perf" aria-hidden="true" />

          <div className="qr__meta">
            <div className="qr__expira">
              <span className="qr__expira-label">Expira em:</span>
              <span
                className={
                  'qr__time' +
                  (left <= 60 ? ' is-warning' : '') +
                  (left <= 10 ? ' is-urgent' : '')
                }
              >
                <ClockIcon size={16} />
                {Math.floor(Math.max(0, left) / 60)}m{' '}
                <span className="qr__secs">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={Math.max(0, left) % 60}
                      initial={{ y: 9, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -9, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {String(Math.max(0, left) % 60).padStart(2, '0')}
                    </motion.span>
                  </AnimatePresence>
                </span>
                s
              </span>
            </div>
            <span className="qr__off">{venue.discount}% OFF</span>
          </div>

          <div className={'qr__code' + (revealed && !expired ? ' is-revealed' : '')}>
            <img className="qr__img" src={qrSrc} alt={revealed && !expired ? 'QR Code do seu vale' : ''} aria-hidden={!revealed || expired} />
            {(!revealed || expired) && (
              <button type="button" className="qr__reveal" onClick={expired ? renew : reveal}>
                {expired ? 'QR expirado — gerar novo' : 'Clique para revelar o QR'}
              </button>
            )}
          </div>

          <div className={'qr__codeline' + (revealed && !expired ? ' is-revealed' : '')}>
            <span className="qr__codeline-label">Código:</span>
            <span className="qr__codeline-value">TST-R2-776884</span>
          </div>
        </div>

        <p className="voucher__hint voucher__hint--tight">
          Mostre pro garçom antes de fechar a conta
        </p>
      </div>
    </motion.main>
  )
}
