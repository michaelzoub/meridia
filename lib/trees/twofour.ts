/**
 * 2-4 Tree (B-tree of order 4).
 * Each node holds 1–3 keys and 2–4 children (or 0 for leaves).
 */
export interface TwoFourNode {
  keys: number[];
  children: TwoFourNode[];
  accessCount: number[];
}

function makeNode(keys: number[] = [], children: TwoFourNode[] = []): TwoFourNode {
  return { keys, children, accessCount: keys.map(() => 0) };
}

function isLeaf(n: TwoFourNode): boolean {
  return n.children.length === 0;
}

/** Split child i of parent (child must be full = 3 keys) */
function splitChild(parent: TwoFourNode, i: number): void {
  const full = parent.children[i];
  const mid = full.keys[1];
  const left = makeNode([full.keys[0]], isLeaf(full) ? [] : [full.children[0], full.children[1]]);
  left.accessCount = [full.accessCount[0]];
  const right = makeNode([full.keys[2]], isLeaf(full) ? [] : [full.children[2], full.children[3]]);
  right.accessCount = [full.accessCount[2]];

  parent.keys.splice(i, 0, mid);
  parent.accessCount.splice(i, 0, full.accessCount[1]);
  parent.children.splice(i, 1, left, right);
}

function insertNonFull(node: TwoFourNode, key: number): void {
  if (isLeaf(node)) {
    let i = node.keys.length - 1;
    while (i >= 0 && key < node.keys[i]) i--;
    if (i >= 0 && node.keys[i] === key) return; // duplicate
    node.keys.splice(i + 1, 0, key);
    node.accessCount.splice(i + 1, 0, 0);
    return;
  }
  let i = node.keys.length - 1;
  while (i >= 0 && key < node.keys[i]) i--;
  if (i >= 0 && node.keys[i] === key) return; // duplicate
  i++;
  if (node.children[i].keys.length === 3) {
    splitChild(node, i);
    if (key > node.keys[i]) i++;
    if (key === node.keys[i]) return;
  }
  insertNonFull(node.children[i], key);
}

function searchNode(node: TwoFourNode | null, key: number): boolean {
  if (!node) return false;
  let i = 0;
  while (i < node.keys.length && key > node.keys[i]) i++;
  if (i < node.keys.length && node.keys[i] === key) {
    node.accessCount[i]++;
    return true;
  }
  if (isLeaf(node)) return false;
  return searchNode(node.children[i], key);
}

function findMinKey(node: TwoFourNode): number {
  if (isLeaf(node)) return node.keys[0];
  return findMinKey(node.children[0]);
}

function deleteFromNode(node: TwoFourNode, key: number): void {
  const t = 2; // minimum degree for 2-4 tree
  let i = 0;
  while (i < node.keys.length && key > node.keys[i]) i++;

  if (i < node.keys.length && node.keys[i] === key) {
    // Key found in this node
    if (isLeaf(node)) {
      node.keys.splice(i, 1);
      node.accessCount.splice(i, 1);
      return;
    }
    // Internal node
    if (node.children[i].keys.length >= t) {
      // Find predecessor
      let pred = node.children[i];
      while (!isLeaf(pred)) pred = pred.children[pred.children.length - 1];
      const predKey = pred.keys[pred.keys.length - 1];
      node.keys[i] = predKey;
      node.accessCount[i] = 0;
      deleteFromNode(node.children[i], predKey);
    } else if (node.children[i + 1].keys.length >= t) {
      // Find successor
      let succ = node.children[i + 1];
      while (!isLeaf(succ)) succ = succ.children[0];
      const succKey = succ.keys[0];
      node.keys[i] = succKey;
      node.accessCount[i] = 0;
      deleteFromNode(node.children[i + 1], succKey);
    } else {
      // Merge children[i] and children[i+1]
      mergeChildren(node, i);
      deleteFromNode(node.children[i], key);
    }
    return;
  }

  // Key not in this node
  if (isLeaf(node)) return;

  const childIdx = i;
  const child = node.children[childIdx];

  if (child.keys.length < t) {
    // Fix child to have at least t keys
    const leftSib = childIdx > 0 ? node.children[childIdx - 1] : null;
    const rightSib = childIdx < node.children.length - 1 ? node.children[childIdx + 1] : null;

    if (leftSib && leftSib.keys.length >= t) {
      // Borrow from left sibling
      child.keys.unshift(node.keys[childIdx - 1]);
      child.accessCount.unshift(0);
      node.keys[childIdx - 1] = leftSib.keys[leftSib.keys.length - 1];
      node.accessCount[childIdx - 1] = 0;
      leftSib.keys.pop();
      leftSib.accessCount.pop();
      if (!isLeaf(leftSib)) {
        child.children.unshift(leftSib.children[leftSib.children.length - 1]);
        leftSib.children.pop();
      }
    } else if (rightSib && rightSib.keys.length >= t) {
      // Borrow from right sibling
      child.keys.push(node.keys[childIdx]);
      child.accessCount.push(0);
      node.keys[childIdx] = rightSib.keys[0];
      node.accessCount[childIdx] = 0;
      rightSib.keys.shift();
      rightSib.accessCount.shift();
      if (!isLeaf(rightSib)) {
        child.children.push(rightSib.children[0]);
        rightSib.children.shift();
      }
    } else {
      // Merge
      if (leftSib) {
        mergeChildren(node, childIdx - 1);
        deleteFromNode(node.children[childIdx - 1], key);
        return;
      } else {
        mergeChildren(node, childIdx);
        deleteFromNode(node.children[childIdx], key);
        return;
      }
    }
  }
  deleteFromNode(node.children[childIdx], key);
}

function mergeChildren(parent: TwoFourNode, i: number): void {
  const left = parent.children[i];
  const right = parent.children[i + 1];
  left.keys.push(parent.keys[i], ...right.keys);
  left.accessCount.push(parent.accessCount[i], ...right.accessCount);
  left.children.push(...right.children);
  parent.keys.splice(i, 1);
  parent.accessCount.splice(i, 1);
  parent.children.splice(i + 1, 1);
}

export class TwoFourTree {
  root: TwoFourNode | null = null;

  insert(key: number): void {
    if (!this.root) {
      this.root = makeNode([key]);
      return;
    }
    if (this.root.keys.length === 3) {
      const newRoot = makeNode([], [this.root]);
      splitChild(newRoot, 0);
      this.root = newRoot;
    }
    insertNonFull(this.root, key);
  }

  delete(key: number): void {
    if (!this.root) return;
    deleteFromNode(this.root, key);
    if (this.root.keys.length === 0 && this.root.children.length > 0) {
      this.root = this.root.children[0];
    }
    if (this.root.keys.length === 0) this.root = null;
  }

  search(key: number): boolean {
    return searchNode(this.root, key);
  }

  height(): number {
    function h(n: TwoFourNode | null): number {
      if (!n) return 0;
      if (isLeaf(n)) return 1;
      return 1 + Math.max(...n.children.map(h));
    }
    return h(this.root);
  }

  size(): number {
    let count = 0;
    const stack: (TwoFourNode | null)[] = [this.root];
    while (stack.length) {
      const n = stack.pop();
      if (!n) continue;
      count += n.keys.length;
      for (const c of n.children) stack.push(c);
    }
    return count;
  }

  clear(): void {
    this.root = null;
  }
}
