/**
 * This class helping to use regular javascript array same way as mongo collection
 */
export class Collection {
	data: any

	constructor(data: any = []) {
		this.data = data
	}

	async find(query: any = {}, options: any = {}): Promise<any[]> {
		const queryFields = Object.keys(query)
		const filterFn = (entry: any): boolean => queryFields.every((queryField: any): boolean => entry[queryField] === query[queryField])
		return this.data.filter(filterFn)
	}
}
