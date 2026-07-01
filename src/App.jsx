import { useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Welcome from './screens/Welcome'
import Login from './screens/Login'
import Onboard from './screens/Onboard'
import Home from './screens/Home'
import VoucherDetail from './screens/VoucherDetail'
import QrCode from './screens/QrCode'

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

// Each screen's solid background, keyed by route. Painting it on <html> fills
// the iOS safe areas (behind the status bar / toolbar) with the screen colour,
// and the theme-color meta tints Safari's own chrome to match — no grey seams.
const SCREEN_BG = {
  '/': '#ff5c0a',
  '/login': '#e9e8e2',
  '/name': '#e9e8e2',
  '/email': '#e9e8e2',
  '/home': '#e9e8e2',
}
const bgFor = (p) => (p.startsWith('/voucher') ? '#e9e8e2' : SCREEN_BG[p] ?? '#ff5c0a')

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const color = bgFor(location.pathname)
    document.documentElement.style.background = color
    document.body.style.background = color
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  }, [location.pathname])

  // Onboarding profile, collected across /name → /email. Controlled here so a
  // value survives the back button.
  const [profile, setProfile] = useState({ member: null, name: '', email: '' })
  const set = (patch) => setProfile((p) => ({ ...p, ...patch }))

  const handleAuthenticated = (member) => {
    set({ member })
    navigate('/name')
  }

  return (
    <div className="app">
      <MotionConfig reducedMotion="user">
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <Welcome
                onSelectFriend={() => navigate('/login')}
                onSelectAdmin={() => {
                  /* Admin flow not built yet */
                }}
                onSelectStaff={() => navigate('/login')} /* ponytail: no staff flow yet */
              />
            }
          />
          <Route
            path="/login"
            element={<Login onAuthenticated={handleAuthenticated} onBack={() => navigate('/')} />}
          />
          <Route
            path="/name"
            element={
              <Onboard
                label="Seu nome"
                step={1}
                steps={2}
                eyebrow="Quase lá,"
                title="Como você se chama?"
                placeholder="NOME"
                value={profile.name}
                onChange={(name) => set({ name })}
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                onContinue={(name) => {
                  set({ name })
                  navigate('/email')
                }}
                onBack={() => navigate('/login')}
              />
            }
          />
          <Route
            path="/email"
            element={
              <Onboard
                label="Seu email"
                step={2}
                steps={2}
                eyebrow="Só mais um detalhe,"
                title={
                  <>
                    Qual o seu
                    <br />
                    email?
                  </>
                }
                placeholder="nome@gmail.com"
                value={profile.email}
                onChange={(email) => set({ email })}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                enterKeyHint="go"
                isValid={isEmail}
                onContinue={(email) => {
                  set({ email })
                  navigate('/home')
                }}
                onBack={() => navigate('/name')}
              />
            }
          />
          <Route path="/home" element={<Home />} />
          <Route path="/voucher/:id" element={<VoucherDetail />} />
          <Route path="/voucher/:id/qr" element={<QrCode />} />
        </Routes>
      </AnimatePresence>
      </MotionConfig>
    </div>
  )
}
