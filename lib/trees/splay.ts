export interface SplayNode {
  key: number;
  left: SplayNode | null;
  right: SplayNode | null;
  accessCount: number;
  recentlyAccessed: boolean;
}

function makeNode(key: number): SplayNode {
  return { key, left: null, right: null, accessCount: 0, recentlyAccessed: false };
}

function rotateRight(x: SplayNode): SplayNode {
  const y = x.left!;
  x.left = y.right;
  y.right = x;
  return y;
}

function rotateLeft(x: SplayNode): SplayNode {
  const y = x.right!;
  x.right = y.left;
  y.left = x;
  return y;
}

/** Top-down splay: brings key (or closest) to root */
function splay(root: SplayNode | null, key: number): SplayNode | null {
  if (!root) return null;

  const header: SplayNode = { key: 0, left: null, right: null, accessCount: 0, recentlyAccessed: false };
  let l: SplayNode = header;
  let r: SplayNode = header;
  let t: SplayNode = root;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (key < t.key) {
      if (!t.left) break;
      if (key < t.left.key) {
        // zig-zig
        t = rotateRight(t);
        if (!t.left) break;
      }
      // link right
      r.left = t;
      r = t;
      t = t.left!;
    } else if (key > t.key) {
      if (!t.right) break;
      if (key > t.right.key) {
        // zig-zig
        t = rotateLeft(t);
        if (!t.right) break;
      }
      // link left
      l.right = t;
      l = t;
      t = t.right!;
    } else {
      break;
    }
  }

  l.right = t.left;
  r.left = t.right;
  t.left = header.right;
  t.right = header.left;
  return t;
}

export class SplayTree {
  root: SplayNode | null = null;
  recentPath: number[] = [];

  insert(key: number): void {
    this.root = splay(this.root, key);
    if (!this.root) {
      this.root = makeNode(key);
      return;
    }
    if (this.root.key === key) return;
    const n = makeNode(key);
    if (key < this.root.key) {
      n.right = this.root;
      n.left = this.root.left;
      this.root.left = null;
    } else {
      n.left = this.root;
      n.right = this.root.right;
      this.root.right = null;
    }
    this.root = n;
  }

  delete(key: number): void {
    this.root = splay(this.root, key);
    if (!this.root || this.root.key !== key) return;
    if (!this.root.left) {
      this.root = this.root.right;
    } else {
      const right = this.root.right;
      this.root = splay(this.root.left, key);
      if (this.root) this.root.right = right;
    }
  }

  search(key: number): boolean {
    this.root = splay(this.root, key);
    if (this.root && this.root.key === key) {
      this.root.accessCount++;
      this.root.recentlyAccessed = true;
      this.recentPath = [key];
      return true;
    }
    return false;
  }

  height(): number {
    function h(n: SplayNode | null): number {
      if (!n) return 0;
      return 1 + Math.max(h(n.left), h(n.right));
    }
    return h(this.root);
  }

  size(): number {
    let count = 0;
    const stack: (SplayNode | null)[] = [this.root];
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
    this.recentPath = [];
  }
}
