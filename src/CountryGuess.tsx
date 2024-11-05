import { useContext, useEffect, useState } from "react"
import { GameContext } from "./GameProvider"
import { Country } from "./countries"


const CountryGuess = ({ country }: { country: Country }) => {
  const { hintedCountries, capitalsFound, guessCapital } = useContext(GameContext)
  const [guessingCapital, setGuessingCapital] = useState<boolean>(false)
  const [capital, setCapital] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (capitalsFound.has(country)) {
      setGuessingCapital(false)
      setCapital(capitalsFound.get(country))
    }
  }, [capitalsFound, country])

  return (
    <div>
      <div
        className={`p-2 rounded-lg shadow-sm font-semibold text-xl dark:text-black ${hintedCountries.has(country) ? 'bg-orange-200' : 'bg-green-200'}`}
      >
        {
          !guessingCapital ?
            <div
              className="flex justify-between"
              onClick={() => {
                if (!capitalsFound.has(country)) {
                  setGuessingCapital(true)
                }
              }}>
              <div>{country}</div>
              <div>{capital && `${capital}`}</div>
            </div>
            :
            <input
              autoFocus
              type='text'
              placeholder={`Capitale ${country}`}
              className="bg-transparent text-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  guessCapital(country, e.currentTarget.value.trim())
                  setGuessingCapital(false)
                }
              }} />
        }
      </div>
    </div>
  )
}

export default CountryGuess