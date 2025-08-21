import { StateChangeFunction, type UseComboboxPropGetters } from 'downshift'
import {
	type Dispatch,
	type SetStateAction,
	Suspense,
	use,
	useState,
	useTransition,
	useEffect,
	useRef,
} from 'react'
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type ClientLoaderFunctionArgs,
	useLoaderData,
} from 'react-router'
import { useSpinDelay } from 'spin-delay'
import { Button } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table'

import {
	CitiesContextProvider,
	useCitiesContext,
} from '#app/providers/city-provider.client.tsx'
import { useCombobox, useForceRerender } from './utils.tsx'

type City = {
	id: string
	country: string
	name: string
	lat: string
	lng: string
}

export async function loader({ params }: LoaderFunctionArgs) {
	return {}
}

// interface ClientLoaderReturnType {
// 	initialCitiesPromise: React.Dispatch<City[] | Promise<City[]>>
// 	searchCities: Function
// }

export const clientLoader = async ({
	request,
	params,
	serverLoader,
}: ClientLoaderFunctionArgs) => {
	// @kentcdodds leaving this here for discussion... is this possible in client loader? I have moved it to a context provider.
	// const worker = new Worker(
	// 	new URL('../../workers/filter-cities.worker', import.meta.url),
	// 	{ type: 'module' },
	// )

	// const filterCities = Comlink.wrap<Exposed>(worker)

	// async function searchCities(input: string) {
	// 	return filterCities.searchCities(input)
	// }

	// const initialCitiesPromise = await searchCities('')

	return {}
}

clientLoader.hydrate = true

export function HydrateFallback() {
	return <div>Loading...</div>
}

export async function action({ params }: ActionFunctionArgs) {
	return {}
}

export default function CityRoute() {
	return (
		<>
			<CitiesContextProvider>
				<div className="container mt-36 mb-48 flex flex-col items-center justify-center gap-6">
					<Suspense fallback="Loading...">
						<CityChooser />
					</Suspense>
				</div>
			</CitiesContextProvider>
		</>
	)
}

function CityChooser() {
	const forceRerender = useForceRerender()
	const [isTransitionPending, startTransition] = useTransition()
	const [inputValue, setInputValue] = useState('')
	const { citiesPromise, setCitiesPromise, searchCities } = useCitiesContext()
	const cities = use(citiesPromise)

	const isPending = useSpinDelay(isTransitionPending)

	const {
		selectedItem: selectedCity,
		highlightedIndex,
		getInputProps,
		getItemProps,
		getLabelProps,
		getMenuProps,
		selectItem,
	} = useCombobox({
		items: cities,
		inputValue,
		onInputValueChange: ({ inputValue: newValue = '' }) => {
			setInputValue(newValue)
			startTransition(() => {
				setCitiesPromise(searchCities(newValue))
			})
		},
		onSelectedItemChange: ({ selectedItem: selectedCity }) =>
			alert(
				selectedCity
					? `You selected ${selectedCity.name}`
					: 'Selection Cleared',
			),
		itemToString: (city) => (city ? city.name : ''),
	})

	return (
		<div className="city-app w-xs xl:w-xl">
			<Button onClick={forceRerender} className="w-full">
				force rerender
			</Button>
			<div>
				<label {...getLabelProps()}>Find a city</label>
				<div className="flex gap-2">
					<Input {...getInputProps({ type: 'text' })} />
					<Button onClick={() => selectItem(null)} aria-label="toggle menu">
						&#10005;
					</Button>
				</div>
				<Table {...getMenuProps({ style: { opacity: isPending ? 0.6 : 1 } })}>
					<TableCaption>A list of cities.</TableCaption>
					<TableHeader>
						<TableRow>
							<TableHead className="">City</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{cities.map((city, index) => (
							<ListItem
								key={city.id}
								index={index}
								selectedCity={selectedCity}
								highlightedIndex={highlightedIndex}
								city={city}
								getItemProps={getItemProps}
							/>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

function ListItem<City extends { id: string; name: string }>({
	index,
	city,
	selectedCity,
	highlightedIndex,
	getItemProps,
}: {
	index: number
	city: City
	selectedCity: City | null
	highlightedIndex: number
	getItemProps: UseComboboxPropGetters<City>['getItemProps']
}) {
	const isSelected = selectedCity?.id === city.id
	const isHighlighted = highlightedIndex === index

	return (
		<>
			<TableRow
				key={city.id}
				{...getItemProps({
					index,
					item: city,
					style: {
						fontWeight: isSelected ? 'bold' : 'normal',
						backgroundColor: isHighlighted ? 'lightgray' : 'inherit',
					},
				})}
			>
				<TableCell>{city.name}</TableCell>
			</TableRow>
		</>
	)
}
