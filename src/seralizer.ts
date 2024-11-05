import bs58 from "bs58"
import { GameState } from "./GameProvider"
import { countries } from "./countries"

export const serializeState = (state: GameState) => {
  const {
    score,
    currentLetter,
    countriesFound,
    countriesLeftRevealed,
    hintedCountries,
    capitalsFound,
  } = state
  if (!currentLetter) {
    return ""
  }
  const score_int16 = new Int16Array([score])
  const currentLetter_char = new Uint8Array([currentLetter.charCodeAt(0)])

  // list the countries starting with the current letter
  const letterCountries = new Map(
    [...countries].filter(c => c[0].startsWith(currentLetter))
  )

  let countriesFoundBitmap = 0
  countriesFound.forEach(country => {
    const countryIndex = [...letterCountries.keys()].indexOf(country)
    countriesFoundBitmap |= 1 << countryIndex
  })
  const countriesFoundUint32 = new Uint32Array([countriesFoundBitmap])

  if (countriesLeftRevealed) {
    countriesFoundUint32[0] |= 0x80000000
  }

  // list the countries that have been hinted
  let hintedCountriesBitmap = 0
  hintedCountries.forEach(country => {
    const countryIndex = [...letterCountries.keys()].indexOf(country)
    hintedCountriesBitmap |= 1 << countryIndex
  })
  const hintedCountriesUint32 = new Uint32Array([hintedCountriesBitmap])

  // list the capitals that have been found
  let capitalsFoundBitmap = 0
  capitalsFound.forEach(capital => {
    const capitalIndex = [...letterCountries.values()].indexOf(capital)
    capitalsFoundBitmap |= 1 << capitalIndex
  })
  const capitalsFoundUint32 = new Uint32Array([capitalsFoundBitmap])

  // make byte array
  const byteArray = new Uint8Array(2 + 1 + 4 + 4 + 4)
  byteArray.set(new Uint8Array(score_int16.buffer), 0)
  byteArray.set(new Uint8Array(currentLetter_char.buffer), 2)
  byteArray.set(new Uint8Array(countriesFoundUint32.buffer), 3)
  byteArray.set(new Uint8Array(hintedCountriesUint32.buffer), 7)
  byteArray.set(new Uint8Array(capitalsFoundUint32.buffer), 11)

  // convert to base58
  return bs58.encode(byteArray)
}

export const deserializeState: (serialized: string) => GameState = (
  serialized: string
) => {
  const byteArray = bs58.decode(serialized)
  const score_int16 = new Int16Array(byteArray.slice(0, 2).buffer)
  const currentLetter_char = String.fromCharCode(byteArray[2])
  const countriesFoundUint32 = new Uint32Array(byteArray.slice(3, 7).buffer)
  const hintedCountriesUint32 = new Uint32Array(byteArray.slice(7, 11).buffer)
  const capitalsFoundUint32 = new Uint32Array(byteArray.slice(11, 15).buffer)

  const letterCountries = new Map(
    [...countries].filter(c => c[0].startsWith(currentLetter_char))
  )
  const countriesFound = [...letterCountries.keys()].filter(
    (_, i) => countriesFoundUint32[0] & 0x7ffffff & (1 << i)
  )
  const hintedCountries = [...letterCountries.keys()].filter(
    (_, i) => hintedCountriesUint32[0] & (1 << i)
  )
  const capitalsFound = [...letterCountries.entries()].filter(
    (_, i) => capitalsFoundUint32[0] & (1 << i)
  )

  const isRevealed = (countriesFoundUint32[0] & 0x80000000) !== 0

  return {
    score: score_int16[0],
    currentLetter: currentLetter_char,
    countriesFound: new Set(countriesFound),
    hintedCountries: new Set(hintedCountries),
    capitalsFound: new Map(capitalsFound),
    countriesLeftRevealed: isRevealed,
  }
}
