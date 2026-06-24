import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Splash from './screens/Splash'
import Welcome from './screens/Welcome'
import Login from './screens/Login'

// Each screen's solid background, keyed by route. Painting it on <html> fills
// the iOS safe areas (behind the status bar / toolbar) with the screen colour,
// and the theme-color meta tints Safari's own chrome to match — no grey seams.
const SCREEN_BG = {
  '/': '#ff5c0a',
  '/welcome': '#ff5c0a',
  '/login': '#e9e8e2',
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const color = SCREEN_BG[location.pathname] ?? '#ff5c0a'
    document.documentElement.style.background = color
    document.body.style.background = color
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  }, [location.pathname])

  const handleAuthenticated = (member) => {
    // Next screens (venue list) come later — for now confirm the match.
    console.log('Acesso liberado:', member)
  }

  return (
    <div className="app">
      {/* No mode="wait": screens crossfade — splash fades out as the receipt prints */}
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Splash onDone={() => navigate('/welcome')} />} />
          <Route
            path="/welcome"
            element={
              <Welcome
                onSelectFriend={() => navigate('/login')}
                onSelectAdmin={() => {
                  /* Admin flow not built yet */
                }}
              />
            }
          />
          <Route
            path="/login"
            element={<Login onAuthenticated={handleAuthenticated} onBack={() => navigate('/welcome')} />}
          />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
