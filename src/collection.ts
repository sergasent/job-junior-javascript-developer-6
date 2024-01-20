/**
 * This class helping to use regular javascript array same way as mongo collection
 */
export class Collection {
	data: any

	constructor(data: any = []) {
		this.data = data
	}

	getLimitedData(data: any[], count: number): any {
		return data.slice(0, count)
	}

	async find(query: any = {}, options: any = {}): Promise<any[]> {
		const queryFields = Object.keys(query)
		const filterFn = (entry: any): boolean => queryFields.every((queryField: any): boolean => entry[queryField] === query[queryField])
		const res = this.data.filter(filterFn)
		if ('limit' in options) {
			return this.getLimitedData(res, options['limit'])
		}

		return res
	}
}
