import { useContext } from 'react'
import './App.css'
import { GameContext } from './GameProvider'
import CountryGuess from './CountryGuess'
import Button from './Button'

function App() {
  const {
    score,
    currentLetter,
    countries,
    countriesFound,
    countriesLeftRevealed,
    guessCountry,
    tryNextLetter,
    hint,
    reset
  } = useContext(GameContext)
  const numCountriesFound = [...countriesFound].filter(c => c[0] === currentLetter).length
  let total = "?"
  if (countriesLeftRevealed) {
    total = ([...countries.keys()].filter(c => c[0] === currentLetter).length).toFixed()
  }

  return (
    <div className='flex flex-col space-y-2'>
      <h1 className="text-4xl font-bold mb-5">
        {score}
      </h1>
      {
        currentLetter && <>
          <div className="flex justify-between text-xl">
            <p className='rounded-lg bg-violet-200 px-2 font-bold'>{currentLetter?.toUpperCase()}</p>
            <p className='font-semibold'>{numCountriesFound} / {total}</p>
          </div>
          <input
            type='text'
            placeholder='Pays'
            className='border-2 border-blue-200 rounded-lg p-1 px-2 shadow-sm text-xl'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log(e.currentTarget.value)
                if (guessCountry(e.currentTarget.value)) {
                  e.currentTarget.value = ''
                }
              }
            }
            } />
          <div className='flex flex-col space-y-1'>
            {[...countriesFound].map((country) => (
              <CountryGuess key={country} country={country} />
            ))}
          </div>
          <div className='flex flex-col space-y-1'>
            <Button onClick={tryNextLetter}>➡️&nbsp;&nbsp;Lettre suivante</Button>
            <Button onClick={hint}>😛&nbsp;&nbsp;Langue au chat</Button>
          </div>
        </>
      }
      <div className='flex flex-col pt-5'>
        <Button onClick={reset} className='bg-red-400'>🔃&nbsp;&nbsp;Recommencer</Button>
      </div>
    </div >
  )
}

export default App
