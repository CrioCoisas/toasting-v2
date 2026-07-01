import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Receipt from '../components/Receipt'
import './Welcome.css'

// How far the receipt travels (its own height). Kept in sync with --receipt-h.
const TRAVEL = 410

// Paper feeds out in eased pushes with a brief dwell between each — reads as a
// printer advancing line by line, not one slide. Each push is decelerated
// (FEED), the dwells hold (linear), and the last push settles soft.
const FEED = [0.4, 0, 0.2, 1]
const SETTLE = [0.22, 1, 0.36, 1]
const PRINT = {
  y: [TRAVEL, 328, 328, 246, 246, 164, 164, 82, 82, 0],
  times: [0, 0.14, 0.2, 0.34, 0.4, 0.54, 0.6, 0.74, 0.8, 1],
  ease: [FEED, 'linear', FEED, 'linear', FEED, 'linear', FEED, 'linear', SETTLE],
}
const PRINT_MS = 2200

export default function Welcome({ onSelectFriend, onSelectAdmin, onSelectStaff }) {
  const reduce = useReducedMotion()
  const [printed, setPrinted] = useState(false)

  // Buttons don't wait for the print to finish — they rise in early, while the
  // paper is still feeding.
  useEffect(() => {
    const t = setTimeout(() => setPrinted(true), reduce ? 150 : 450)
    return () => clearTimeout(t)
  }, [reduce])

  const actions = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.07 } },
  }
  const rise = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 26 },
        show: {
          opacity: 1,
          y: 0,
          transition: { type: 'spring', duration: 0.55, bounce: 0.2 },
        },
      }

  return (
    <motion.div
      className="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.35 }}
    >
      <div className="welcome__stage">
        <div className="printer">
          <div className="printer__clip">
            <motion.div
              className="printer__paper"
              initial={reduce ? { y: 0 } : { y: TRAVEL }}
              animate={reduce ? { y: 0 } : { y: PRINT.y }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: PRINT_MS / 1000, times: PRINT.times, ease: PRINT.ease }
              }
            >
              <Receipt />
            </motion.div>
          </div>
          {/* The slot the paper feeds through — drawn over the seam */}
          <svg
            className="printer__slot"
            viewBox="0 0 335 8"
            width="335"
            height="8"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M6.50788 1.31479C7.57176 0.463685 8.89362 0 10.2561 0H324.047C325.409 0 326.731 0.463684 327.795 1.31479L333.925 6.21913C334.663 6.80964 334.246 8 333.301 8H1.00214C0.0568614 8 -0.360685 6.80964 0.377453 6.21913L6.50788 1.31479Z"
              fill="var(--orange-deep)"
            />
          </svg>
        </div>
      </div>

      <motion.div
        className="welcome__actions"
        variants={actions}
        initial="hidden"
        animate={printed ? 'show' : 'hidden'}
      >
        <motion.button
          type="button"
          className="role-btn role-btn--admin"
          variants={rise}
          onClick={onSelectAdmin}
        >
          Continuar como Admin
        </motion.button>
        <motion.button
          type="button"
          className="role-btn role-btn--friend"
          variants={rise}
          onClick={onSelectFriend}
        >
          Continuar como Amigo
        </motion.button>
        <motion.button
          type="button"
          className="role-staff"
          variants={rise}
          onClick={onSelectStaff}
        >
          Sou funcionário do grupo
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
