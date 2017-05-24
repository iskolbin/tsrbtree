import { TreeMap } from './TreeMap'

export class TreeSet<T> extends TreeMap<T,T> {
	constructor( iterable?: T[], comparator?: (a: T, b: T) => number ) {
		super( undefined, comparator )
		if ( iterable ) {
			for ( const v of iterable ) {
				this.add( v )
			}
		}
	}
	
	add( value: T ): TreeSet<T> {
		return this.set( value, value ) as TreeSet<T>
	}

	filter<Z>(
		callbackFn?: (this: Z, value: T, key: T, tree: TreeSet<T> ) => boolean,
		thisArg?: Z, result?: TreeSet<T>
	): TreeSet<T> {
		return super.filter<Z>(
			callbackFn,
			thisArg,
			result !== undefined ? result : new TreeSet<T>( undefined, this._comparator)
		) as TreeSet<T>
	}
}
