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

// Real venue info (address, neighborhood, schedule, kind) from production.
// bg / ink are sampled from the brand sheet; discount defaults to 10 (Amigos).
export const VENUES = [
  {
    id: 'giancarlo', name: 'Giancarlo', kind: 'Restaurante', bg: '#870000', ink: '#f4ebdd', logo: giancarlo,
    street: 'Rua Oliveira Fausto, 11', neighborhood: 'Botafogo, Rio de Janeiro',
    hours: [['Ter–Qui', '12h – 00h'], ['Sex–Sáb', '12h – 01h'], ['Dom', '12h – 23h'], ['Seg', 'fechado']],
  },
  {
    id: 'quartinho', name: 'Quartinho', kind: 'Restaurante', bg: '#e03834', ink: '#fff4ee', logo: quartinho, discount: 5,
    street: 'Rua Arnaldo Quintela, 124', neighborhood: 'Botafogo, Rio de Janeiro',
    hours: [['Ter–Qua', '18h – 01h'], ['Qui–Sáb', '18h – 02h'], ['Dom–Seg', 'fechado']],
  },
  {
    id: 'dainer', name: 'Dainer', kind: 'Restaurante', bg: '#eed385', ink: '#2a2206', logo: dainer,
    street: 'Rua Real Grandeza, 193', neighborhood: 'Botafogo, Rio de Janeiro',
    hours: [['Ter–Sex', '8h – 19h'], ['Sáb', '9h – 20h'], ['Dom', '9h – 17h'], ['Seg', 'fechado']],
  },
  {
    id: 'pope', name: 'Pope', kind: 'Restaurante', bg: '#7b9edc', ink: '#0e2244', logo: pope, discount: 5,
    street: 'Rua Joana Angélica, 47 · loja 101', neighborhood: 'Ipanema, Rio de Janeiro',
    hours: [['Ter–Qui', '18h – 00h'], ['Sex', '18h – 01h'], ['Sáb', '12h – 01h'], ['Dom', '12h – 23h'], ['Seg', 'fechado']],
  },
  {
    id: 'chanchada', name: 'Chanchada', kind: 'Restaurante', bg: '#473230', ink: '#eff1da', logo: chanchada,
    street: 'Rua General Polidoro, 164 · loja B', neighborhood: 'Botafogo, Rio de Janeiro',
    hours: [['Ter–Sáb', '12h – 01h'], ['Dom', '12h – 22h'], ['Seg', 'fechado']],
  },
  {
    id: 'guadalupe', name: 'Guadalupe', kind: 'Restaurante', bg: '#232222', ink: '#e9e6da', logo: guadalupe, discount: 5,
    street: 'Rua Real Grandeza, 193 · loja 5 (entrada Henrique de Novais)', neighborhood: 'Botafogo, Rio de Janeiro',
    hours: [['Ter–Sex', '17h – 23h30'], ['Sáb–Dom', '12h – 23h30'], ['Seg', 'fechado']],
  },
  {
    id: 'cafe18', name: 'Café 18 do Forte', kind: 'Café', bg: '#f8f5d3', ink: '#232222', logo: cafe18,
    street: 'Praça Coronel Eugênio Franco, 1 · Forte de Copacabana', neighborhood: 'Copacabana, Rio de Janeiro',
    hours: [['Ter–Dom', '10h – 19h'], ['Seg', 'fechado']],
  },
  {
    id: 'dejavu', name: 'Deja Vu', kind: 'Restaurante', bg: '#f9f9f1', ink: '#3a2a22', logo: dejavu, discount: 5,
    street: 'Rua do Russel, 344', neighborhood: 'Glória, Rio de Janeiro',
    hours: [['Qua', '18h – 23h30'], ['Qui–Sex', '18h – 00h30'], ['Sáb', '15h – 00h30'], ['Dom', '15h – 22h30'], ['Seg–Ter', 'fechado']],
  },
  {
    id: 'fatchia', name: 'Fatchia', kind: 'Restaurante', bg: '#870000', ink: '#d19051', logo: fatchia,
    street: 'Rua Benjamin Constant, 8', neighborhood: 'Glória, Rio de Janeiro',
    hours: [['Qua, Dom', '19h – 00h'], ['Qui–Sáb', '19h – 01h'], ['Seg–Ter', 'fechado']],
  },
].map((v) => ({
  discount: 10,
  ...v,
  label: v.kind.toUpperCase(),
  address: [v.street, v.neighborhood],
}))
