import { useContext, useState } from 'react'
import './App.css'
import { GameContext } from './GameProvider'
import CountryGuess from './CountryGuess'
import Button from './Button'
import Sync from './Sync'
import { countries } from './countries'
import { ConfirmableButton } from './ConfirmableButton'
import { normalize } from './seralizer'

function App() {
  const {
    score,
    currentLetter,
    countriesFound,
    countriesLeftRevealed,
    guessCountry,
    tryNextLetter,
    hint,
    reset
  } = useContext(GameContext)
  const numCountriesFound = currentLetter ?
    [...countriesFound].map(normalize).filter(c => (c as string).startsWith(currentLetter)).length
    :
    [...countries.keys()].length

  let total = "?"
  if (countriesLeftRevealed && currentLetter) {
    total = ([...countries.keys()].map(normalize).filter(c => c.startsWith(currentLetter)).length).toFixed()
  }

  const [sync, setSync] = useState<boolean>(false)

  return (
    <>
      {
        sync ? <Sync onClose={() => setSync(false)} /> :
          <div className='flex flex-col space-y-2'>
            <h1 className="text-4xl font-bold mb-5">
              {score}
            </h1>
            {
              currentLetter && <>
                <div className="flex justify-between text-xl">
                  <p className='rounded-lg bg-violet-200 dark:text-black px-2 font-bold'>{currentLetter?.toUpperCase()}</p>
                  <p className='font-semibold'>{numCountriesFound} / {total}</p>
                </div>
                <input
                  type='text'
                  placeholder='Pays'
                  className='border-2 border-blue-200 rounded-lg p-1 px-2 shadow-sm text-xl'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (guessCountry(e.currentTarget.value.trim())) {
                        e.currentTarget.value = ''
                      }
                    }
                  }
                  } />
                <div className='flex flex-col space-y-1'>
                  {[...countriesFound].map((country) => (
                    <CountryGuess key={country as string} country={country} />
                  ))}
                </div>
                <div className='flex flex-col space-y-1'>
                  <ConfirmableButton onConfirm={tryNextLetter}>➡️&nbsp;&nbsp;Lettre suivante</ConfirmableButton>
                  <ConfirmableButton onConfirm={hint}>😛&nbsp;&nbsp;Langue au chat</ConfirmableButton>
                </div>
              </>
            }
            <div className='flex flex-col pt-5 space-y-1'>
              <Button onClick={() => setSync(true)}>📂&nbsp;&nbsp;Sync</Button>
              <ConfirmableButton onConfirm={reset} className='bg-red-500 hover:bg-red-400'>🔄&nbsp;&nbsp;Reset</ConfirmableButton>
            </div>
          </div >
      }
    </>
  )
}

export default App
