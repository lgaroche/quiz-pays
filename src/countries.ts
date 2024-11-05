import list from "./liste"

export type Country = (typeof list)[number]["nom"]
export type Capital = (typeof list)[number]["capitale"]

export const countries = new Map<Country, Capital>(
  list.map(country => [country.nom, country.capitale])
)
