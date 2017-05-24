export const enum RBColor {
	Red = 0,
	Black = 1
}

export const enum RBDirection {
	Left = 0,
	Right = 1
}

export type MaybeRBNode<K,V> = RBNode<K,V> | undefined

export function isRed<K,V>( node: MaybeRBNode<K,V> ) {
	return node !== undefined && node.color == RBColor.Red
}

export class RBNode<K,V> {
	constructor(
		public key: K,
		public value: V,
		public left: MaybeRBNode<K,V> = undefined,
		public right: MaybeRBNode<K,V> = undefined,
		public color: RBColor = RBColor.Red
	) {}

	set( dir: RBDirection, node: MaybeRBNode<K,V> ): void {
		if ( dir === RBDirection.Left ) {
			this.left = node
		} else {
			this.right = node
		}
	}

	get( dir: RBDirection ): MaybeRBNode<K,V> {
		if ( dir === RBDirection.Left ) {
			return this.left
		} else {
			return this.right
		}
	}

	singleRotation( dir: RBDirection ): RBNode<K,V> {
		const negDir = dir === 0 ? 1 : 0
		const temp: MaybeRBNode<K,V> = this.get( negDir )
		if ( temp !== undefined ) {
			this.set( negDir, temp.get( dir ))
			temp.set( dir, this )
			this.color = RBColor.Red
			temp.color = RBColor.Black
			return temp
		} else {
			return this
		}
	}

	doubleRotation( dir: RBDirection ): RBNode<K,V> {
		const negDir = dir === 0 ? 1 : 0
		const temp = this.get( negDir )
		if ( temp !== undefined ) {
			this.set( negDir, temp.singleRotation( negDir ))
		}
		return this.singleRotation( dir )
	}
}
