import { useMemo } from 'react'
import Logo from './Logo'

// Scalloped top edge, lifted straight from the Figma "Receipt" path (width 282).
// It's a 10px-tall white cap; the body below grows freely so we can drop more
// rows above the perforation line later without touching the shape.
const SCALLOP =
  'M0 0H13C13 5.52285 17.4772 10 23 10C28.5228 10 33 5.52285 33 0H46.5713C46.5713 5.5228 51.0485 9.99993 56.5713 10C62.0941 10 66.5713 5.52285 66.5713 0H80.1426C80.1426 5.52276 84.6199 9.99985 90.1426 10C95.6654 10 100.143 5.52285 100.143 0H113.714C113.714 5.52271 118.191 9.99978 123.714 10C129.237 10 133.714 5.52285 133.714 0H147.286C147.286 5.52285 151.763 10 157.286 10C162.636 9.99978 167.005 5.79818 167.272 0.514648L167.286 0H180.857C180.857 5.52285 185.335 10 190.857 10C196.208 9.99985 200.576 5.79822 200.844 0.514648L200.857 0H214.429C214.429 5.52285 218.906 10 224.429 10C229.779 9.99992 234.148 5.79828 234.416 0.514648L234.429 0H248C248 5.52285 252.477 10 258 10C263.35 9.99999 267.719 5.79833 267.987 0.514648L268 0H282V10H0Z'

// Barcode bars — widths (px) alternating black/gap across the 145px Figma vector.
const BARS = [
  3, 2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3, 2, 1, 3,
  1, 2, 2, 1, 3, 1, 2, 1, 3, 2, 1, 1, 2,
]

const BARS_W = BARS.reduce((a, b) => a + b, 0)

function Barcode() {
  let x = 0
  return (
    <svg
      className="receipt__barcode"
      viewBox={`0 0 ${BARS_W} 27`}
      width="145"
      height="27"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {BARS.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height="27" fill="#0e0d07" /> : null
        x += w
        return rect
      })}
    </svg>
  )
}

// Computed once per mount so they don't flicker through the print animation.
function useReceiptData() {
  return useMemo(() => {
    const now = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
    const h12 = now.getHours() % 12 || 12
    const time = `${pad(h12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    return { stamp: `${date}, ${time} ${ampm}` }
  }, [])
}

export default function Receipt() {
  const { stamp } = useReceiptData()
  return (
    <div className="receipt" role="img" aria-label="Recibo Toasting">
      <svg
        className="receipt__cap"
        viewBox="0 0 282 10"
        width="282"
        height="10"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={SCALLOP} fill="var(--paper)" />
      </svg>

      <div className="receipt__body">
        <div className="receipt__head">
          <Logo width={120} />
          <span className="receipt__chip">APP</span>
        </div>

        <div className="receipt__addr">
          <p>2026 Toasting App</p>
          <p>Rio de Janeiro, RJ</p>
          <p>{stamp}</p>
        </div>

        <div className="receipt__perf" aria-hidden="true">{'='.repeat(48)}</div>

        <div className="receipt__footer">
          <p className="receipt__msg">Bora pedir? A cozinha já tá ligada!</p>
          <Barcode />
        </div>
      </div>
    </div>
  )
}
