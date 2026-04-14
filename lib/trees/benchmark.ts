import { AVLTree } from "./avl";
import { RedBlackTree } from "./redblack";
import { SplayTree } from "./splay";
import { TwoFourTree } from "./twofour";

export type AccessPattern = "uniform" | "sequential" | "skewed";
export type Operation = "insert" | "lookup" | "delete";
export type TreeType = "avl" | "redblack" | "splay" | "twofour";

export interface BenchmarkConfig {
  n: number;
  pattern: AccessPattern;
  operation: Operation;
  trees: TreeType[];
  customData?: number[];
}

export interface HeightSample {
  batch: number;
  height: number;
}

export interface TreeResult {
  tree: TreeType;
  totalMs: number;
  opsPerMs: number;
  finalHeight: number;
  heightSamples: HeightSample[];
}

export interface BenchmarkResult {
  config: BenchmarkConfig;
  results: TreeResult[];
  splayAccessCounts: Map<number, number>;
}

/** Zipf-distributed key generator: 80% of accesses hit 20% of keys */
function zipfKeys(n: number, hotKeys: number[]): number[] {
  const keys: number[] = [];
  const hotCount = Math.floor(n * 0.8);
  const coldCount = n - hotCount;
  const allKeys = Array.from({ length: n }, (_, i) => i + 1);
  const hot = hotKeys.slice(0, Math.floor(allKeys.length * 0.2));

  for (let i = 0; i < hotCount; i++) keys.push(hot[Math.floor(Math.random() * hot.length)]);
  for (let i = 0; i < coldCount; i++) keys.push(allKeys[Math.floor(Math.random() * allKeys.length)]);
  // shuffle
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
}

function generateKeys(n: number, pattern: AccessPattern, customData?: number[]): number[] {
  if (customData && customData.length > 0) {
    const data = customData.slice(0, n);
    // pad if needed
    while (data.length < n) data.push(data[Math.floor(Math.random() * data.length)]);
    return data;
  }

  const base = Array.from({ length: n }, (_, i) => i + 1);

  if (pattern === "sequential") return base;

  if (pattern === "uniform") {
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    return base;
  }

  // skewed
  const hotKeys = base.slice(0, Math.floor(n * 0.2));
  return zipfKeys(n, hotKeys);
}

function benchmarkTree(
  treeType: TreeType,
  keys: number[],
  operation: Operation,
  batchSize: number
): { totalMs: number; finalHeight: number; heightSamples: HeightSample[]; splayCounts: Map<number, number> } {
  let tree: AVLTree | RedBlackTree | SplayTree | TwoFourTree;
  switch (treeType) {
    case "avl": tree = new AVLTree(); break;
    case "redblack": tree = new RedBlackTree(); break;
    case "splay": tree = new SplayTree(); break;
    case "twofour": tree = new TwoFourTree(); break;
  }

  const n = keys.length;
  const heightSamples: HeightSample[] = [];
  const splayCounts = new Map<number, number>();

  // Pre-populate for lookup/delete
  if (operation !== "insert") {
    for (const k of keys) tree.insert(k);
  }

  const start = performance.now();

  for (let i = 0; i < n; i++) {
    const k = keys[i];
    if (operation === "insert") tree.insert(k);
    else if (operation === "lookup") {
      tree.search(k);
      if (treeType === "splay" && (tree as SplayTree).root) {
        const root = (tree as SplayTree).root!;
        splayCounts.set(root.key, (splayCounts.get(root.key) ?? 0) + 1);
      }
    }
    else tree.delete(k);

    if ((i + 1) % batchSize === 0) {
      heightSamples.push({ batch: (i + 1) / batchSize, height: tree.height() });
    }
  }

  const totalMs = performance.now() - start;

  // Collect splay access counts from nodes
  if (treeType === "splay") {
    const splayTree = tree as SplayTree;
    const stack: (import("./splay").SplayNode | null)[] = [splayTree.root];
    while (stack.length) {
      const node = stack.pop();
      if (!node) continue;
      if (node.accessCount > 0) splayCounts.set(node.key, node.accessCount);
      stack.push(node.left, node.right);
    }
  }

  return { totalMs, finalHeight: tree.height(), heightSamples, splayCounts };
}

export function runBenchmark(config: BenchmarkConfig): BenchmarkResult {
  const { n, pattern, operation, trees, customData } = config;
  const keys = generateKeys(n, pattern, customData);
  const batchSize = Math.max(100, Math.floor(n / 100));

  const results: TreeResult[] = [];
  const splayAccessCounts = new Map<number, number>();

  for (const treeType of trees) {
    const { totalMs, finalHeight, heightSamples, splayCounts } = benchmarkTree(
      treeType, [...keys], operation, batchSize
    );
    results.push({
      tree: treeType,
      totalMs,
      opsPerMs: n / Math.max(totalMs, 0.001),
      finalHeight,
      heightSamples,
    });
    if (treeType === "splay") {
      splayCounts.forEach((v, k) => splayAccessCounts.set(k, v));
    }
  }

  return { config, results, splayAccessCounts };
}

/** Multi-N sweep for the ops/ms vs N line chart */
export interface SweepPoint {
  n: number;
  tree: TreeType;
  opsPerMs: number;
}

export function runSweep(
  nValues: number[],
  pattern: AccessPattern,
  operation: Operation,
  trees: TreeType[]
): SweepPoint[] {
  const points: SweepPoint[] = [];
  for (const n of nValues) {
    const keys = generateKeys(n, pattern);
    const batchSize = Math.max(100, Math.floor(n / 100));
    for (const treeType of trees) {
      const { totalMs } = benchmarkTree(treeType, [...keys], operation, batchSize);
      points.push({ n, tree: treeType, opsPerMs: n / Math.max(totalMs, 0.001) });
    }
  }
  return points;
}
