import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Splash from './screens/Splash'
import Welcome from './screens/Welcome'
import Login from './screens/Login'

// Each screen's solid background. Painting it on <html> fills the iOS safe
// areas (behind the status bar / toolbar) with the screen colour, and the
// theme-color meta tints Safari's own chrome to match — no grey seams.
const SCREEN_BG = {
  splash: '#ff5c0a',
  welcome: '#ff5c0a',
  login: '#e9e8e2',
}

export default function App() {
  const [screen, setScreen] = useState('splash')

  useEffect(() => {
    const color = SCREEN_BG[screen] ?? '#ff5c0a'
    document.documentElement.style.background = color
    document.body.style.background = color
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  }, [screen])

  const handleAuthenticated = (member) => {
    // Next screens (venue list) come later — for now confirm the match.
    console.log('Acesso liberado:', member)
  }

  return (
    <div className="app">
      {/* No mode="wait": screens crossfade — splash fades out as the receipt prints */}
      <AnimatePresence>
        {screen === 'splash' && <Splash key="splash" onDone={() => setScreen('welcome')} />}
        {screen === 'welcome' && (
          <Welcome
            key="welcome"
            onSelectFriend={() => setScreen('login')}
            onSelectAdmin={() => {
              /* Admin flow not built yet */
            }}
          />
        )}
        {screen === 'login' && <Login key="login" onAuthenticated={handleAuthenticated} />}
      </AnimatePresence>
    </div>
  )
}
