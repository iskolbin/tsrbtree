export const enum Color {
	Red = 0,
	Black = 1
}

export const enum Direction {
	Left = 0,
	Right = 1
}

export type MaybeTreeNode<K,V> = TreeNode<K,V> | undefined

export function isRed<K,V>( node: MaybeTreeNode<K,V> ): node is TreeNode<K,V> {
	return node !== undefined && node.color == Color.Red
}

export class TreeNode<K,V> {
	constructor(
		public key: K,
		public value: V,
		public left: MaybeTreeNode<K,V> = undefined,
		public right: MaybeTreeNode<K,V> = undefined,
		public color: Color = Color.Red
	) {}

	set( dir: Direction, node: MaybeTreeNode<K,V> ): void {
		if ( dir === Direction.Left ) {
			this.left = node
		} else {
			this.right = node
		}
	}

	get( dir: Direction ): MaybeTreeNode<K,V> {
		if ( dir === Direction.Left ) {
			return this.left
		} else {
			return this.right
		}
	}

	singleRotation( dir: Direction ): TreeNode<K,V> {
		const negDir = dir === 0 ? 1 : 0
		const temp: MaybeTreeNode<K,V> = this.get( negDir )
		if ( temp !== undefined ) {
			this.set( negDir, temp.get( dir ))
			temp.set( dir, this )
			this.color = Color.Red
			temp.color = Color.Black
			return temp
		} else {
			return this
		}
	}

	doubleRotation( dir: Direction ): TreeNode<K,V> {
		const negDir = dir === 0 ? 1 : 0
		const temp = this.get( negDir )
		if ( temp !== undefined ) {
			this.set( negDir, temp.singleRotation( negDir ))
		}
		return this.singleRotation( dir )
	}
}
