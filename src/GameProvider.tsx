import { createContext, useEffect, useState } from 'react'
import list from "./liste"

interface GameState {
  score: number
  currentLetter?: string
  countries: Map<string, string>
  countriesFound: Set<string>
  countriesLeftRevealed: boolean
  hintedCountries: Set<string>
  capitalsFound: Map<string, string>
  guessCountry: (country: string) => boolean
  guessCapital: (country: string, capital: string) => boolean
  tryNextLetter: () => boolean
  hint: () => void
  reset: () => void
}

const GameContext = createContext<GameState>({
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
  reset: () => { }
})

import { ReactNode } from 'react';

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [score, setScore] = useState(0)
  const [currentLetter, setCurrentLetter] = useState<string | undefined>('a')
  const [guesses, setGuesses] = useState<Set<string>>(new Set())
  const [hintedCountries, setHintedCountries] = useState<Set<string>>(new Set())
  const [countries, setCountries] = useState(new Map())
  const [isRevealed, setIsRevealed] = useState(false)
  const [capitalsFound, setCapitalsFound] = useState(new Map())

  useEffect(() => {
    const state = localStorage.getItem('gameState')
    console.log(state)
    if (state) {
      const { score, currentLetter, guesses, countries, countriesLeftRevealed, hintedCountries, capitalsFound } = JSON.parse(state)
      setScore(score)
      setCurrentLetter(currentLetter)
      setCountries(new Map(countries))
      setGuesses(new Set(guesses))
      setIsRevealed(countriesLeftRevealed)
      setHintedCountries(new Set(hintedCountries))
      setCapitalsFound(new Map(capitalsFound))
    } else {
      const countries = new Map(list.map(country => [country.nom.toLowerCase(), country.capitale]))
      setCountries(countries)
    }
  }, [])

  useEffect(() => {
    if (score > 0) {
      localStorage.setItem('gameState', JSON.stringify({
        score,
        currentLetter,
        countriesLeftRevealed: isRevealed,
        guesses: [...guesses],
        countries: [...countries],
        hintedCountries: [...hintedCountries],
        capitalsFound: [...capitalsFound]
      }))
    }
  }, [score, currentLetter, guesses, countries, isRevealed, hintedCountries, capitalsFound])

  const gameState = {
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
          console.log('correct')
          setScore(score + 1)
          setGuesses(new Set([...guesses, guess]))
          return true
        }
      }
      console.log('wrong')
      return false
    },
    guessCapital: (country: string, capital: string) => {
      const guess = capital.toLowerCase()
      if (!capitalsFound.has(country)) {
        const c = countries.get(country).toLowerCase()
        if (c && c === guess) {
          console.log(`found ${c}`)
          setScore(score + 1)
          setCapitalsFound(new Map([...capitalsFound, [country, c]]))
          return true
        }
      }
      console.log(`wrong capital ${guess} for ${country}`)
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
          console.log("game over")
          setCurrentLetter(undefined)
        }

        if (!isRevealed) {
          setScore(score + 2)
        }
        setGuesses(new Set())
        setIsRevealed(false)
        return true
      }
      console.log('not all countries found')
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
        console.log(country)
        setScore(score - 1)
        setGuesses(new Set([...guesses, country[0]]))
        setHintedCountries(new Set([...hintedCountries, country[0]]))
      } else {
        setIsRevealed(true)
      }
    }
  }
  return <GameContext.Provider value={gameState}>{children}</GameContext.Provider>
}

export { GameContext }