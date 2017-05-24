import { RBColor, RBDirection, MaybeRBNode, RBNode, isRed } from './RBNode'

const DEL: any = {}

function ALWAYS_TRUE(): boolean {
	return true
}

function DEFAULT_COMPARATOR( a: any, b: any ): number {
	return a < b ? -1 : a > b ? 1 : 0
}

export class RBTree<K,V> {
	protected _root: MaybeRBNode<K,V> = undefined
	protected _size: number = 0
	protected _deleted: number = 0

	constructor( 
		protected _comparator: (a: K, b: K) => number = DEFAULT_COMPARATOR
	) {
	}

	get size(): number {
		return this._size
	}

	protected getNode( key: K ): MaybeRBNode<K,V> {
		let current: MaybeRBNode<K,V> = this._root
		for (;;) {
			if ( current === undefined ) {
				return undefined
			} else {
				const cmp = this._comparator( key, current.key ) 
				if ( cmp === 0 ) {
					return current
				} else {
					current = current.get( cmp < 0 ? RBDirection.Left : RBDirection.Right )
				}
			}
		}
	}

	has( key: K ): boolean {
		const node = this.getNode( key )
		return node !== undefined && node.value !== DEL
	}

	get( key: K ): V | undefined {
		const node = this.getNode( key )
		return (node === undefined || node.value === DEL ) ? undefined : node.value
	}

	set( key: K, value: V ): RBTree<K,V> {
		if ( this._root === undefined ) {
			this._root = new RBNode( key, value )
			this._size++
		} else {
			let head: RBNode<K,V> = new RBNode( key, value )
			let gp: MaybeRBNode<K,V> = undefined
			let ggp: RBNode<K,V> = head
			let p: MaybeRBNode<K,V> = undefined
			let node: MaybeRBNode<K,V> = this._root
			let dir: RBDirection = RBDirection.Left
			let last: RBDirection = RBDirection.Left

			ggp.set( RBDirection.Right, this._root )

			for (;;) {
				if ( node === undefined ) {
					node = new RBNode( key, value );
					(<RBNode<K,V>>p).set( dir, node )
					this._size++
				} else {
					const {left, right} = node
					if ( isRed( left ) && isRed( right )) {
						node.color = RBColor.Red
						left.color = RBColor.Black
						right.color = RBColor.Black
					}
				}

				if ( isRed( node ) && isRed( p )) {
					const dir2: RBDirection = ggp.right === gp ? RBDirection.Right : RBDirection.Left
					const negLast = last === RBDirection.Left ? RBDirection.Right : RBDirection.Left 
					if ( node === p.get( last )) {
						ggp.set( dir2, gp !== undefined ? gp.singleRotation( negLast ) : gp )
					} else {
						ggp.set( dir2, gp !== undefined ? gp.doubleRotation( negLast ) : gp )
					}
				}

				if ( node.key === key ) {
					if ( node.value === DEL ) {
						this._size++
						this._deleted--
					}
					node.value = value
					
					break
				}

				last = dir
				dir = node.key < key ? RBDirection.Right : RBDirection.Left

				if ( gp !== undefined ) {
					ggp = gp
				}

				gp = p
				p = node
				node = node.get( dir )
			}
			this._root = head.right
		}

		(<RBNode<K,V>>this._root).color = RBColor.Black
		return this
	}

	delete( key: K ): boolean {
		const node = this.getNode( key )
		if ( node === undefined || node.value === DEL ) {
			return false
		} else {
			node.value = DEL
			this._size--
			this._deleted++
			return true
		}
	}

	clear(): void {
		if ( this._root !== undefined ) {
			this._root = undefined
			this._size = 0
			this._deleted = 0
		}
	}

	forEach<Z>( callbackFn: (this: Z, value: V, key: K, tree: RBTree<K,V>) => void, thisArg?: Z ): void {
		const stack: RBNode<K,V>[] = []
		if ( this._root ) stack.push( this._root )
		for ( let node = stack.pop(); node !== undefined; node = stack.pop()) {
			const {key, value, left, right} = node
			if ( left ) stack.push( left )
			if ( value !== DEL ) callbackFn.call( thisArg, value, key, this )
			if ( right ) stack.push( right )
		}
	}

	filter<Z>( callbackFn: (this: Z, value: V, key: K, tree: RBTree<K,V>) => boolean = ALWAYS_TRUE, thisArg?: Z ): RBTree<K,V> {
		const result = new RBTree<K,V>( this._comparator )
		this.forEach<Z>( ( v: V, k: K, tree: RBTree<K,V> ): void => {
			if ( v !== DEL && callbackFn.call( thisArg, v, k, tree )) {
				result.set( k, v )
			}
		}, thisArg )
		return result
	}
}
