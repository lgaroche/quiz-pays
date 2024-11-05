import { createContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { Capital, countries, Country } from './countries'
import { deserializeState, serializeState } from './seralizer'

export interface GameState {
  score: number
  currentLetter?: string
  countriesFound: Set<Country>
  countriesLeftRevealed: boolean
  hintedCountries: Set<Country>
  capitalsFound: Map<Country, Capital>
}

const defaultState: GameState = {
  score: 0,
  currentLetter: 'A',
  countriesFound: new Set<Country>(),
  countriesLeftRevealed: false,
  hintedCountries: new Set<Country>(),
  capitalsFound: new Map()
}

interface ProviderProps extends GameState {
  guessCountry: (country: string) => boolean
  guessCapital: (country: Country, capital: string) => boolean
  tryNextLetter: () => boolean
  hint: () => void
  reset: () => void
  serialize: () => string
  deserialize: (data: string) => void
}

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, "-")

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
    console.log(state)
    localStorage.setItem('gameState-code', serializeState(state))
  }, [state])

  const value = useMemo(() => ({
    ...state,
    guessCountry: (guess: string) => {
      if (!state.currentLetter) {
        return false
      }
      console.log(guess, state.currentLetter)
      if (guess.toUpperCase().startsWith(state.currentLetter)) {
        const found = [...countries.keys()].find(c => normalize(c) === normalize(guess))
        if (state.countriesFound.has(found as Country)) {
          return false
        }
        if (found) {
          console.log(found)
          setState(state => ({
            ...state,
            score: state.score + 1,
            countriesFound: new Set([...state.countriesFound, found])
          }) as GameState)
          return true
        }
      }
      return false
    },
    guessCapital: (country: Country, guess: string) => {
      console.log(country, guess)
      if (!state.capitalsFound.has(country)) {
        const capital = countries.get(country)
        const found = normalize(capital as string) === normalize(guess)
        if (found) {
          setState(state => ({
            ...state,
            score: state.score + 1,
            capitalsFound: new Map([...state.capitalsFound, [country, capital]])
          }) as GameState)
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
        const newLetter = currentLetter < 'Z' ? String.fromCharCode(currentLetter.charCodeAt(0) + 1) : undefined
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

      const country = [...countries.keys()]
        .filter(c => c.startsWith(currentLetter))
        .find(c => !countriesFound.has(c as Country) && !hintedCountries.has(c as Country))
      if (country) {
        setState({
          ...state,
          score: score - 1,
          countriesFound: new Set([...countriesFound, country as Country]),
          hintedCountries: new Set([...hintedCountries, country as Country]
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