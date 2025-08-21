// @kentcdodds leaving this here for discussion. Does thi sbelong in useContext or here?
// import * as Comlink from 'comlink'
// import { type Exposed } from './filter-cities.worker.ts'

// export const worker = new Worker(
// 	new URL('./filter-cities.worker', import.meta.url), {type:"module"}
// )

// export const filterCities = Comlink.wrap<Exposed>(worker)

// export async function searchCities(input: string) {
// 	return filterCities.searchCities(input)
// }

// export const initialCitiesPromise = searchCities('')