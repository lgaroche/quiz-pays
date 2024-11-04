import { createContext, useEffect, useState, ReactNode, useMemo } from 'react'
import list from "./liste"
import { deserializeState, serializeState } from './seralizer'

interface GameState {
  score: number
  currentLetter?: string
  countries: Map<string, string>
  countriesFound: Set<string>
  countriesLeftRevealed: boolean
  hintedCountries: Set<string>
  capitalsFound: Map<string, string>
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

const GameContext = createContext<ProviderProps>({
  score: 0,
  currentLetter: 'a',
  countries: new Map(),
  countriesFound: new Set(),
  countriesLeftRevealed: false,
  hintedCountries: new Set(),
  capitalsFound: new Map(),
  guessCountry: () => false,
  guessCapital: () => false,
  tryNextLetter: () => false,
  hint: () => { },
  reset: () => { },
  serialize: () => '',
  deserialize: () => { }
})

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [serialized, setSerialized] = useState('')
  const [score, setScore] = useState(0)
  const [currentLetter, setCurrentLetter] = useState<string | undefined>('a')
  const [guesses, setGuesses] = useState<Set<string>>(new Set())
  const [hintedCountries, setHintedCountries] = useState<Set<string>>(new Set())
  const [countries, setCountries] = useState(new Map())
  const [isRevealed, setIsRevealed] = useState(false)
  const [capitalsFound, setCapitalsFound] = useState(new Map())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const code = localStorage.getItem('gameState-code')
    const countries = new Map(list.map(country => [country.nom.toLowerCase(), country.capitale]))
    if (code) {
      setSerialized(code)
    }
    setCountries(countries)
  }, [])

  useEffect(() => {
    if (!loaded) {
      return
    }
    const newState = serializeState(currentLetter!, countries, hintedCountries, capitalsFound, guesses, score, isRevealed)
    setSerialized(newState)
  }, [score, currentLetter, guesses, isRevealed, hintedCountries, capitalsFound, loaded, countries])

  useEffect(() => {
    if (!serialized) {
      return
    }
    const { score, currentLetter, foundCountries, countriesLeftRevealed, hintedCountries, foundCapitals } = deserializeState(serialized, countries)
    setScore(score)
    setCurrentLetter(currentLetter)
    setGuesses(new Set(foundCountries))
    setIsRevealed(countriesLeftRevealed)
    setHintedCountries(new Set(hintedCountries))
    setCapitalsFound(new Map(foundCapitals))
    localStorage.setItem('gameState-code', serialized)
    setLoaded(true)
  }, [countries, loaded, serialized])

  const value = useMemo(() => ({
    score,
    currentLetter,
    countries,
    countriesFound: guesses,
    countriesLeftRevealed: isRevealed,
    hintedCountries,
    capitalsFound,
    guessCountry: (country: string) => {
      if (!currentLetter) {
        return false
      }
      const guess = country.toLowerCase()
      if (!guesses.has(guess) && guess.startsWith(currentLetter)) {
        const c = countries.get(guess.toLowerCase())
        if (c) {
          setScore(score + 1)
          setGuesses(new Set([...guesses, guess]))
          return true
        }
      }
      return false
    },
    guessCapital: (country: string, capital: string) => {
      const guess = capital.toLowerCase()
      if (!capitalsFound.has(country)) {
        const c = countries.get(country).toLowerCase()
        if (c && c === guess) {
          setScore(score + 1)
          setCapitalsFound(new Map([...capitalsFound, [country, c]]))
          return true
        }
      }
      return false
    },
    tryNextLetter: () => {
      if (!currentLetter) {
        return false
      }
      if ([...guesses].length === [...countries.keys()].filter(c => c[0] === currentLetter).length) {
        if (currentLetter < 'z') {
          setCurrentLetter(String.fromCharCode(currentLetter!.charCodeAt(0) + 1))
        } else {
          setCurrentLetter(undefined)
        }

        if (!isRevealed) {
          setScore(score + 2)
        }
        setGuesses(new Set())
        setHintedCountries(new Set())
        setCapitalsFound(new Map())
        setIsRevealed(false)
        return true
      }
      setIsRevealed(true)
      return false
    },
    reset: () => {
      setScore(0)
      setCurrentLetter('a')
      setGuesses(new Set())
      setIsRevealed(false)
      setHintedCountries(new Set())
      setCapitalsFound(new Map())
      localStorage.removeItem('gameState')
    },
    hint: () => {
      if (!currentLetter) {
        return
      }
      const country = [...countries].find(([c]) => c[0] === currentLetter && !guesses.has(c))
      if (country) {
        setScore(score - 1)
        setGuesses(new Set([...guesses, country[0]]))
        setHintedCountries(new Set([...hintedCountries, country[0]]))
      } else {
        setIsRevealed(true)
      }
    },
    serialize: () => serializeState(currentLetter!, countries, hintedCountries, capitalsFound, guesses, score, isRevealed),
    deserialize: setSerialized
  }), [score, currentLetter, countries, guesses, isRevealed, hintedCountries, capitalsFound])

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { GameContext }