import { useEffect } from 'react'
import { motion, useSpring, useReducedMotion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { BackIcon, QrIcon } from '../components/icons'
import VoucherCard from '../components/VoucherCard'
import { VENUES } from '../data/venues'
import { pageFade } from '../motion'
import './Voucher.css'

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export default function VoucherDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const venue = VENUES.find((v) => v.id === id) ?? VENUES[0]

  // The ticket tilts in 3D toward the phone's orientation. Springs smooth the
  // raw sensor stream so the card glides instead of jittering.
  const reduce = useReducedMotion()
  const rotateX = useSpring(0, { stiffness: 120, damping: 20, mass: 0.6 })
  const rotateY = useSpring(0, { stiffness: 120, damping: 20, mass: 0.6 })

  useEffect(() => {
    if (reduce) return
    const onTilt = (e) => {
      // gamma = left/right (−90..90), beta = front/back; assume the phone is
      // held tilted ~45° toward the user, so subtract that as the neutral point.
      rotateY.set(clamp(e.gamma ?? 0, -28, 28) * 0.5)
      rotateX.set(clamp((e.beta ?? 45) - 45, -28, 28) * -0.45)
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [reduce, rotateX, rotateY])

  // iOS 13+ gates the motion sensors behind a permission prompt that must be
  // triggered by a user gesture — ask once on the first touch.
  const askMotion = () => {
    const D = typeof window !== 'undefined' && window.DeviceOrientationEvent
    if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {})
  }

  return (
    <motion.main className="voucher" {...pageFade} onPointerDown={askMotion}>
      <button type="button" className="voucher__back" onClick={() => navigate('/home')} aria-label="Voltar">
        <BackIcon size={24} />
      </button>

      <div className="voucher__body">
        <div className="voucher__ticket">
          <motion.div
            className="voucher__float"
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div className="voucher__tilt" style={{ rotateX, rotateY }}>
              <VoucherCard venue={venue} />
            </motion.div>
          </motion.div>
        </div>

        <p className="voucher__hint">
          Mostre o QRCode para o garçom antes de fechar a conta. Válido apenas para sua comanda, uma vez por
          visita.
        </p>

        <button
          type="button"
          className="voucher__cta"
          onClick={() => navigate(`/voucher/${venue.id}/qr`)}
        >
          <QrIcon size={20} />
          Gerar QRCode
        </button>
      </div>
    </motion.main>
  )
}
