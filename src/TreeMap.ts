import { Color, Direction, MaybeTreeNode, TreeNode, isRed } from './TreeNode'

const DEL: any = {}

function ALWAYS_TRUE(): boolean {
	return true
}

function DEFAULT_COMPARATOR( a: any, b: any ): number {
	return a < b ? -1 : a > b ? 1 : 0
}

export class TreeMap<K,V> {
	protected _root: MaybeTreeNode<K,V> = undefined
	protected _size: number = 0
	protected _deleted: number = 0
	protected _comparator: (a: K, b: K) => number 

	constructor(
		iterable?: [K,V][],
		comparator: ( a: K, b: K ) => number = DEFAULT_COMPARATOR 
	) { 
		this._comparator = comparator
		if ( iterable ) {
			for ( const [k,v] of iterable ) {
				this.set( k, v )
			}
		}
	}

	get size(): number {
		return this._size
	}

	get deleted(): number {
		return this._deleted
	}

	protected getNode( key: K ): MaybeTreeNode<K,V> {
		let current: MaybeTreeNode<K,V> = this._root
		for (;;) {
			if ( current === undefined ) {
				return undefined
			} else {
				const cmp = this._comparator( key, current.key ) 
				if ( cmp === 0 ) {
					return current
				} else {
					current = current.get( cmp < 0 ? Direction.Left : Direction.Right )
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

	set( key: K, value: V ): TreeMap<K,V> {
		if ( this._root === undefined ) {
			this._root = new TreeNode( key, value )
			this._size++
		} else {
			let head: TreeNode<K,V> = new TreeNode( key, value )
			let gp: MaybeTreeNode<K,V> = undefined
			let ggp: TreeNode<K,V> = head
			let p: MaybeTreeNode<K,V> = undefined
			let node: MaybeTreeNode<K,V> = this._root
			let dir: Direction = Direction.Left
			let last: Direction = Direction.Left

			ggp.set( Direction.Right, this._root )

			for (;;) {
				if ( node === undefined ) {
					node = new TreeNode( key, value );
					(<TreeNode<K,V>>p).set( dir, node )
					this._size++
				} else {
					const {left, right} = node
					if ( isRed( left ) && isRed( right )) {
						node.color = Color.Red
						left.color = Color.Black
						right.color = Color.Black
					}
				}

				if ( isRed( node ) && isRed( p )) {
					const dir2: Direction = ggp.right === gp ? Direction.Right : Direction.Left
					const negLast = last === Direction.Left ? Direction.Right : Direction.Left 
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
				dir = node.key < key ? Direction.Right : Direction.Left

				if ( gp !== undefined ) {
					ggp = gp
				}

				gp = p
				p = node
				node = node.get( dir )
			}
			this._root = head.right
		}

		(<TreeNode<K,V>>this._root).color = Color.Black
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

	forEach<Z>(
		callbackFn: (this: Z, value: V, key: K, tree: this) => void,
		thisArg?: Z
	): void {
		const stack: TreeNode<K,V>[] = []
		if ( this._root ) stack.push( this._root )
		for ( let node = stack.pop(); node !== undefined; node = stack.pop()) {
			const {key, value, left, right} = node
			if ( left ) stack.push( left )
			if ( value !== DEL ) callbackFn.call( thisArg, value, key, this )
			if ( right ) stack.push( right )
		}
	}

	filter<Z>(
		callbackFn: (this: Z, value: V, key: K, tree: this ) => boolean = ALWAYS_TRUE,
		thisArg?: Z,
		result: TreeMap<K,V> = new TreeMap<K,V>( undefined,this._comparator )
	): TreeMap<K,V> {	
		this.forEach<Z>( ( v: V, k: K, tree: this ): void => {
			if ( v !== DEL && callbackFn.call( thisArg, v, k, tree )) {
				result.set( k, v )
			}
		}, thisArg )
		return result
	}
}
