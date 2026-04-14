export interface AVLNode {
  key: number;
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;
  accessCount: number;
}

function nodeHeight(n: AVLNode | null): number {
  return n ? n.height : 0;
}

function balanceFactor(n: AVLNode): number {
  return nodeHeight(n.left) - nodeHeight(n.right);
}

function updateHeight(n: AVLNode): void {
  n.height = 1 + Math.max(nodeHeight(n.left), nodeHeight(n.right));
}

function rotateRight(y: AVLNode): AVLNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x: AVLNode): AVLNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function balance(n: AVLNode): AVLNode {
  updateHeight(n);
  const bf = balanceFactor(n);
  if (bf > 1) {
    if (balanceFactor(n.left!) < 0) n.left = rotateLeft(n.left!);
    return rotateRight(n);
  }
  if (bf < -1) {
    if (balanceFactor(n.right!) > 0) n.right = rotateRight(n.right!);
    return rotateLeft(n);
  }
  return n;
}

function insertNode(node: AVLNode | null, key: number): AVLNode {
  if (!node) return { key, height: 1, left: null, right: null, accessCount: 0 };
  if (key < node.key) node.left = insertNode(node.left, key);
  else if (key > node.key) node.right = insertNode(node.right, key);
  else return node;
  return balance(node);
}

function findMin(node: AVLNode): AVLNode {
  while (node.left) node = node.left;
  return node;
}

function deleteNode(node: AVLNode | null, key: number): AVLNode | null {
  if (!node) return null;
  if (key < node.key) node.left = deleteNode(node.left, key);
  else if (key > node.key) node.right = deleteNode(node.right, key);
  else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    const min = findMin(node.right);
    node.key = min.key;
    node.right = deleteNode(node.right, min.key);
  }
  return balance(node);
}

function searchNode(node: AVLNode | null, key: number): boolean {
  if (!node) return false;
  if (key < node.key) return searchNode(node.left, key);
  if (key > node.key) return searchNode(node.right, key);
  node.accessCount++;
  return true;
}

export class AVLTree {
  root: AVLNode | null = null;

  insert(key: number): void {
    this.root = insertNode(this.root, key);
  }

  delete(key: number): void {
    this.root = deleteNode(this.root, key);
  }

  search(key: number): boolean {
    return searchNode(this.root, key);
  }

  height(): number {
    return nodeHeight(this.root);
  }

  size(): number {
    let count = 0;
    const stack: (AVLNode | null)[] = [this.root];
    while (stack.length) {
      const n = stack.pop();
      if (!n) continue;
      count++;
      stack.push(n.left, n.right);
    }
    return count;
  }

  clear(): void {
    this.root = null;
  }
}
