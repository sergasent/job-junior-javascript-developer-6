import type { UsersCollectionType, UsersType } from './types'

type SortOptions = Record<keyof UsersType, number>

type Operators = {
	$gte?: number;
}

type UsersTypeWithOperators = {
	[T in keyof UsersType]?: UsersType[T] | Operators
} & { $or?: Array<{[T in keyof UsersType]?: UsersType[T]}> }

type Options = {
	limit?: number;
	sort?: {[T in keyof UsersType]?: number}
}

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

	checkWithQueryOperators(entry: UsersType, query: UsersTypeWithOperators, queryField: keyof UsersTypeWithOperators): boolean {
		if (queryField === '$or') {
			return query[queryField]?.some((item): boolean => {
				const itemKey = Object.keys(item).at(0) as keyof UsersType
				if (itemKey) {
					return item[itemKey] === entry[itemKey] 
				}
				return false
			}) || false
		}
		else {
			const queryValue = query[queryField]
			if (typeof queryValue !== 'string' && typeof queryValue !== 'number' && typeof queryValue !== 'undefined') {
				let res = false
				if ('$gte' in queryValue) {
					res = this.compareFunc(entry[queryField], queryValue['$gte'] || -1) >= 0
				}
				return res
			}
			return entry[queryField] === query[queryField]
		}
	}

	async find(query: UsersTypeWithOperators = {}, options: Options = {}): Promise<any[]> {
		const queryFields = Object.keys(query) as (keyof UsersTypeWithOperators)[]
		const filterFn = (entry: UsersType): boolean => queryFields.every(
			(queryField: keyof UsersTypeWithOperators): boolean => this.checkWithQueryOperators(entry, query, queryField)
		)
		return this.applyOptions(this.data.filter(filterFn), options)
	}
}
