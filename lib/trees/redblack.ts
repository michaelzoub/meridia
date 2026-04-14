export type RBColor = "RED" | "BLACK";

export interface RBNode {
  key: number;
  color: RBColor;
  left: RBNode;
  right: RBNode;
  parent: RBNode;
  accessCount: number;
  isNIL: boolean;
}

function makeNIL(): RBNode {
  const n = {} as RBNode;
  n.key = 0;
  n.color = "BLACK";
  n.isNIL = true;
  n.accessCount = 0;
  n.left = n;
  n.right = n;
  n.parent = n;
  return n;
}

function makeNode(key: number, NIL: RBNode): RBNode {
  return { key, color: "RED", left: NIL, right: NIL, parent: NIL, accessCount: 0, isNIL: false };
}

export class RedBlackTree {
  private NIL: RBNode;
  root: RBNode;

  constructor() {
    this.NIL = makeNIL();
    this.root = this.NIL;
  }

  private leftRotate(x: RBNode): void {
    const y = x.right;
    x.right = y.left;
    if (!y.left.isNIL) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent.isNIL) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  private rightRotate(y: RBNode): void {
    const x = y.left;
    y.left = x.right;
    if (!x.right.isNIL) x.right.parent = y;
    x.parent = y.parent;
    if (y.parent.isNIL) this.root = x;
    else if (y === y.parent.right) y.parent.right = x;
    else y.parent.left = x;
    x.right = y;
    y.parent = x;
  }

  private insertFixup(z: RBNode): void {
    while (z.parent.color === "RED") {
      if (z.parent === z.parent.parent.left) {
        const y = z.parent.parent.right;
        if (y.color === "RED") {
          z.parent.color = "BLACK";
          y.color = "BLACK";
          z.parent.parent.color = "RED";
          z = z.parent.parent;
        } else {
          if (z === z.parent.right) {
            z = z.parent;
            this.leftRotate(z);
          }
          z.parent.color = "BLACK";
          z.parent.parent.color = "RED";
          this.rightRotate(z.parent.parent);
        }
      } else {
        const y = z.parent.parent.left;
        if (y.color === "RED") {
          z.parent.color = "BLACK";
          y.color = "BLACK";
          z.parent.parent.color = "RED";
          z = z.parent.parent;
        } else {
          if (z === z.parent.left) {
            z = z.parent;
            this.rightRotate(z);
          }
          z.parent.color = "BLACK";
          z.parent.parent.color = "RED";
          this.leftRotate(z.parent.parent);
        }
      }
    }
    this.root.color = "BLACK";
  }

  insert(key: number): void {
    const z = makeNode(key, this.NIL);
    let y: RBNode = this.NIL;
    let x: RBNode = this.root;
    while (!x.isNIL) {
      y = x;
      if (z.key < x.key) x = x.left;
      else if (z.key > x.key) x = x.right;
      else return;
    }
    z.parent = y;
    if (y.isNIL) this.root = z;
    else if (z.key < y.key) y.left = z;
    else y.right = z;
    this.insertFixup(z);
  }

  private transplant(u: RBNode, v: RBNode): void {
    if (u.parent.isNIL) this.root = v;
    else if (u === u.parent.left) u.parent.left = v;
    else u.parent.right = v;
    v.parent = u.parent;
  }

  private deleteFixup(x: RBNode): void {
    while (x !== this.root && x.color === "BLACK") {
      if (x === x.parent.left) {
        let w = x.parent.right;
        if (w.color === "RED") {
          w.color = "BLACK";
          x.parent.color = "RED";
          this.leftRotate(x.parent);
          w = x.parent.right;
        }
        if (w.left.color === "BLACK" && w.right.color === "BLACK") {
          w.color = "RED";
          x = x.parent;
        } else {
          if (w.right.color === "BLACK") {
            w.left.color = "BLACK";
            w.color = "RED";
            this.rightRotate(w);
            w = x.parent.right;
          }
          w.color = x.parent.color;
          x.parent.color = "BLACK";
          w.right.color = "BLACK";
          this.leftRotate(x.parent);
          x = this.root;
        }
      } else {
        let w = x.parent.left;
        if (w.color === "RED") {
          w.color = "BLACK";
          x.parent.color = "RED";
          this.rightRotate(x.parent);
          w = x.parent.left;
        }
        if (w.right.color === "BLACK" && w.left.color === "BLACK") {
          w.color = "RED";
          x = x.parent;
        } else {
          if (w.left.color === "BLACK") {
            w.right.color = "BLACK";
            w.color = "RED";
            this.leftRotate(w);
            w = x.parent.left;
          }
          w.color = x.parent.color;
          x.parent.color = "BLACK";
          w.left.color = "BLACK";
          this.rightRotate(x.parent);
          x = this.root;
        }
      }
    }
    x.color = "BLACK";
  }

  delete(key: number): void {
    let z: RBNode = this.root;
    while (!z.isNIL) {
      if (key < z.key) z = z.left;
      else if (key > z.key) z = z.right;
      else break;
    }
    if (z.isNIL) return;

    let y = z;
    let yOrigColor = y.color;
    let x: RBNode;

    if (z.left.isNIL) {
      x = z.right;
      this.transplant(z, z.right);
    } else if (z.right.isNIL) {
      x = z.left;
      this.transplant(z, z.left);
    } else {
      y = z.right;
      while (!y.left.isNIL) y = y.left;
      yOrigColor = y.color;
      x = y.right;
      if (y.parent === z) x.parent = y;
      else {
        this.transplant(y, y.right);
        y.right = z.right;
        y.right.parent = y;
      }
      this.transplant(z, y);
      y.left = z.left;
      y.left.parent = y;
      y.color = z.color;
    }
    if (yOrigColor === "BLACK") this.deleteFixup(x);
  }

  search(key: number): boolean {
    let x = this.root;
    while (!x.isNIL) {
      if (key < x.key) x = x.left;
      else if (key > x.key) x = x.right;
      else { x.accessCount++; return true; }
    }
    return false;
  }

  height(): number {
    const NIL = this.NIL;
    function h(n: RBNode): number {
      if (n.isNIL) return 0;
      return 1 + Math.max(h(n.left), h(n.right));
    }
    return h(this.root);
  }

  size(): number {
    let count = 0;
    const stack: RBNode[] = [this.root];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.isNIL) continue;
      count++;
      stack.push(n.left, n.right);
    }
    return count;
  }

  clear(): void {
    this.root = this.NIL;
  }

  getNIL(): RBNode {
    return this.NIL;
  }
}
