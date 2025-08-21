import * as Comlink from 'comlink'
import React, { type Dispatch, type SetStateAction } from 'react'

import { type Exposed } from '../workers/filter-cities.worker.ts'

type City = {
	id: string
	country: string
	name: string
	lat: string
	lng: string
}

export type Cities = City[] | Promise<City[]>

export interface CitiesContextProps {
	citiesPromise: Promise<Cities>
	setCitiesPromise: Dispatch<SetStateAction<Promise<Cities>>>
	searchCities: Function
}

const CitiesContext = React.createContext<CitiesContextProps | undefined>(
	undefined,
)

type CitiesContextProviderProps = {
	// filterCities: typeof Comlink.wrap
	children: React.ReactNode
}

const worker = new Worker(
	new URL('../workers/filter-cities.worker', import.meta.url),
	{
		type: 'module',
	},
)

const filterCities = Comlink.wrap<Exposed>(worker)

export const CitiesContextProvider = ({
	// filterCities,
	children,
}: CitiesContextProviderProps) => {
	// @kentcdodds: why if I instantiate the worker here do I get multiple workers (?) i thought CityRoute renders once and therefore the context provider renders once.

	async function searchCities(input: string) {
		return filterCities.searchCities(input)
	}

	const initialCitiesPromise = searchCities('')

	const [citiesPromise, setCitiesPromise] =
		React.useState<Promise<Cities>>(initialCitiesPromise)

	return (
		<CitiesContext.Provider
			value={{
				citiesPromise,
				setCitiesPromise,
				searchCities,
			}}
		>
			{children}
		</CitiesContext.Provider>
	)
}

export const useCitiesContext = () => {
	const context = React.useContext(CitiesContext)
	if (!context) {
		throw new Error(
			'useCitiesContext must be used within a CitiesContextProvider',
		)
	}
	return context
}
