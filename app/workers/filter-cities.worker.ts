import * as Comlink from 'comlink'
import { matchSorter } from 'match-sorter'
import cities from './us-cities.json'

type City = {
	country:string;
	name:string;
	lat:string;
	lng:string;
}

const allCities = cities.map((city:City, index:number) => ({ ...city, id: String(index) }))

export async function searchCities(input: string) {
	return matchSorter(allCities, input, { keys: ['name'] }).slice(0, 500)
}

const exposed = { searchCities }

Comlink.expose(exposed)
export type Exposed = typeof exposed