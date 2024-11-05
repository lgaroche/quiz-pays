import list from "./liste"

export default new Map(
  list.map(country => [
    country.nom.toLowerCase(),
    country.capitale.toLowerCase(),
  ])
)
