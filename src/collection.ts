import type { UsersCollectionType, UsersType } from './types'

type SortOptions = Record<keyof UsersType, number>

/**
 * This class helping to use regular javascript array same way as mongo collection
 */
export class Collection {
	data: UsersCollectionType

	constructor(data: UsersCollectionType = []) {
		this.data = data
	}

	compareFunc(a: number | string, b: number | string): number {
		if (typeof a === 'string' && typeof b === 'string') {
			return b.localeCompare(a)
		}

		if (typeof a === 'number' && typeof b === 'number') {
			return a - b
		}

		return 0
	}

	sortFunc(a: UsersType, b: UsersType, options: SortOptions): number {
		const optionsKeys = Object.keys(options) as (keyof UsersType)[]
		return optionsKeys.reduce<number>((res, optionKey) => {
			let sortRes = 0
			if (options[optionKey] >= 0) {
				sortRes = this.compareFunc(a[optionKey], b[optionKey])
			} else {
				sortRes = this.compareFunc(b[optionKey], a[optionKey])
			}
			
			return res || sortRes
		}, 0)
	}

	getLimitedData(data: UsersCollectionType, count: number): UsersCollectionType {
		return data.slice(0, count)
	}

	applyOptions(data: UsersCollectionType, options: any): UsersCollectionType{
		let res = [...data]

		if ('sort' in options) {
			res.sort((a: UsersType, b: UsersType) => this.sortFunc(a, b, options['sort']))
		}
		
		if ('limit' in options) {
			return this.getLimitedData(res, options['limit'])
		}

		return res
	}

	async find(query: any = {}, options: any = {}): Promise<any[]> {
		const queryFields = Object.keys(query) as (keyof UsersType)[]
		const filterFn = (entry: UsersType): boolean => queryFields.every((queryField: keyof UsersType): boolean => entry[queryField] === query[queryField])
		return this.applyOptions(this.data.filter(filterFn), options)
	}
}
