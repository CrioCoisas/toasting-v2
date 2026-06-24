import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Logo from '../components/Logo'
import './Splash.css'

const HOLD_MS = 1500

export default function Splash({ onDone }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), reduce ? 500 : HOLD_MS)
    return () => clearTimeout(t)
  }, [onDone, reduce])

  return (
    <motion.div
      className="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
    >
      <motion.div
        className="splash__logo"
        initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.94, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Logo width={196} style={{ color: '#ffffff' }} />
      </motion.div>
    </motion.div>
  )
}
