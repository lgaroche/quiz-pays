import { createContext, useEffect, useState, ReactNode, useMemo } from 'react'
import countries from './countries'
import { deserializeState, serializeState } from './seralizer'

export interface GameState {
  score: number
  currentLetter?: string
  countriesFound: Set<string>
  countriesLeftRevealed: boolean
  hintedCountries: Set<string>
  capitalsFound: Map<string, string>
}

const defaultState: GameState = {
  score: 0,
  currentLetter: 'a',
  countriesFound: new Set<string>(),
  countriesLeftRevealed: false,
  hintedCountries: new Set<string>(),
  capitalsFound: new Map()
}

interface ProviderProps extends GameState {
  guessCountry: (country: string) => boolean
  guessCapital: (country: string, capital: string) => boolean
  tryNextLetter: () => boolean
  hint: () => void
  reset: () => void
  serialize: () => string
  deserialize: (data: string) => void
}

const findInList = (list: string[], value: string) => {
  if (value === '') {
    return
  }
  const normalize = (str: string) => str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .toLowerCase()
  console.log(list.map(normalize))
  console.log(normalize(value))
  return list.find(v => normalize(v) === normalize(value))
}

const fromLocalStorage = localStorage.getItem('gameState-code')
const initialState = fromLocalStorage ? deserializeState(fromLocalStorage) : defaultState
console.log(initialState)
const GameContext = createContext<ProviderProps>({
  ...initialState,
  guessCountry: () => false,
  guessCapital: () => false,
  tryNextLetter: () => false,
  hint: () => { },
  reset: () => { },
  serialize: () => '',
  deserialize: () => { }
})

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    localStorage.setItem('gameState-code', serializeState(state))
  }, [state])

  const value = useMemo(() => ({
    ...state,
    guessCountry: (country: string) => {
      if (!state.currentLetter) {
        return false
      }
      const guess = country.toLowerCase().trim()
      if (!state.countriesFound.has(guess) && guess.startsWith(state.currentLetter)) {
        const found = findInList([...countries.keys()], guess)
        if (found) {
          console.log(found)
          setState(state => ({
            ...state,
            score: state.score + 1,
            countriesFound: new Set([...state.countriesFound, found])
          }))
          return true
        }
      }
      return false
    },
    guessCapital: (country: string, capital: string) => {
      if (!state.capitalsFound.has(country)) {
        const found = findInList([countries.get(country) ?? ''], capital)
        if (found) {
          console.log(found)
          setState(state => ({
            ...state,
            score: state.score + 1,
            capitalsFound: new Map([...state.capitalsFound, [country, found]])
          }))
          return true
        }
      }
      return false
    },
    tryNextLetter: () => {
      const { currentLetter, countriesFound, countriesLeftRevealed } = state
      if (!currentLetter) {
        return false
      }
      if ([...countriesFound].length === [...countries.keys()].filter(c => c.startsWith(currentLetter)).length) {
        const newLetter = currentLetter < 'z' ? String.fromCharCode(currentLetter.charCodeAt(0) + 1) : undefined
        const newScore = countriesLeftRevealed ? state.score : state.score + 2
        setState({
          ...defaultState,
          score: newScore,
          currentLetter: newLetter
        })
        return true
      }

      setState({ ...state, countriesLeftRevealed: true })
      return false
    },
    reset: () => {
      setState(defaultState)
      localStorage.removeItem('gameState')
    },
    hint: () => {
      const { currentLetter, score, hintedCountries, countriesFound } = state
      if (!currentLetter) {
        return
      }
      const country = [...countries].find(([c]) => c.startsWith(currentLetter) && !countriesFound.has(c))
      if (country) {
        setState({
          ...state,
          score: score - 1,
          countriesFound: new Set([...countriesFound, country[0]]),
          hintedCountries: new Set([...hintedCountries, country[0]]
          )
        })
      } else {
        setState({ ...state, countriesLeftRevealed: true })
      }
    },
    serialize: () => serializeState(state),
    deserialize: (data: string) => {
      const state = deserializeState(data)
      if (state) {
        setState(state)
      }
    }
  }), [state])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { GameContext }