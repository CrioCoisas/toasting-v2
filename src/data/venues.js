// Logos live in /logos (single-colour white artwork on transparent). They're
// rendered as a CSS mask filled with each card's `ink`, so the wordmark always
// takes the card's text colour — matching the brand sheet.
import giancarlo from '../../logos/giancarlo.png'
import quartinho from '../../logos/quartinho.png'
import dainer from '../../logos/dainer.png'
import pope from '../../logos/pope.png'
import chanchada from '../../logos/chanchada.png'
import guadalupe from '../../logos/guadalupe.png'
import cafe18 from '../../logos/cafe18.png'
import dejavu from '../../logos/dejavu.png'
import fatchia from '../../logos/fatchia.png'

// ponytail: hours + address are the same placeholder for every venue until real
// data lands — they're not in the brand sheet. Swap per-venue when available.
const HOURS = [
  ['Ter-Qua', '18h - 01h'],
  ['Qui-Sáb', '18h - 02h'],
  ['Dom-Seg', 'fechado'],
]
const ADDRESS = ['Rua Arnaldo Quintela, 124', 'Botafogo, Rio de Janeiro']

// bg / ink sampled from the brand sheet. `label` defaults to RESTAURANTE.
export const VENUES = [
  { id: 'giancarlo', name: 'Giancarlo', logo: giancarlo, bg: '#870000', ink: '#f4ebdd' },
  { id: 'quartinho', name: 'Quartinho', logo: quartinho, bg: '#e03834', ink: '#fff4ee', discount: 5 },
  { id: 'dainer', name: 'Dainer', logo: dainer, bg: '#eed385', ink: '#2a2206' },
  { id: 'pope', name: 'Pope', logo: pope, bg: '#7b9edc', ink: '#0e2244', discount: 5 },
  { id: 'chanchada', name: 'Chanchada', logo: chanchada, bg: '#473230', ink: '#eff1da' },
  { id: 'guadalupe', name: 'Guadalupe', logo: guadalupe, bg: '#232222', ink: '#e9e6da', discount: 5 },
  { id: 'cafe18', name: 'Café 18 do Forte', logo: cafe18, bg: '#f8f5d3', ink: '#232222', label: 'CAFÉ' },
  { id: 'dejavu', name: 'Deja Vu', logo: dejavu, bg: '#f9f9f1', ink: '#3a2a22', discount: 5 },
  { id: 'fatchia', name: 'Fatchia', logo: fatchia, bg: '#870000', ink: '#d19051' },
].map((v) => ({ label: 'RESTAURANTE', discount: 10, hours: HOURS, address: ADDRESS, ...v }))
