import { describe, expect, it } from 'vitest';
import {
  frameZeros,
  isComplete,
  markLines,
  reduceMatrix,
  solveAssignment,
} from './hungarian-solver';
import { randomValues, toCells } from './matrix.utils';

const permutations = (n: number): number[][] => {
  if (n === 1) return [[0]];
  return permutations(n - 1).flatMap((p) =>
    Array.from({ length: n }, (_, i) => [...p.slice(0, i), n - 1, ...p.slice(i)]),
  );
};

const bruteForce = (values: number[][], type: 'min' | 'max'): number => {
  const totals = permutations(values.length).map((perm) =>
    perm.reduce((acc, x, y) => acc + values[y][x], 0),
  );
  return type === 'min' ? Math.min(...totals) : Math.max(...totals);
};

/** Small deterministic PRNG so failures are reproducible. */
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

describe('reduceMatrix', () => {
  it('subtracts column then row minimums and computes the lower bound', () => {
    const result = reduceMatrix([
      [4, 1, 3],
      [2, 0, 5],
      [3, 2, 2],
    ]);
    expect(result.columnMins).toEqual([2, 0, 2]);
    expect(result.rowMins).toEqual([1, 0, 0]);
    expect(result.reduced.map((r) => r.map((c) => c.value))).toEqual([
      [1, 0, 0],
      [0, 0, 3],
      [1, 2, 0],
    ]);
    expect(result.lowerBound).toBe(5);
  });
});

describe('frameZeros', () => {
  it('frames one zero per row when possible and crosses the others', () => {
    const framed = frameZeros(
      toCells([
        [1, 0, 0],
        [0, 0, 3],
        [1, 2, 0],
      ]),
    );
    expect(isComplete(framed)).toBe(true);
    expect(framed.flat().filter((c) => c.framed)).toHaveLength(3);
    framed.flat().forEach((c) => {
      if (c.value === 0) expect(c.framed || c.crossed).toBe(true);
    });
  });
});

describe('markLines', () => {
  it('finds a strictly positive uncovered minimum', () => {
    const framed = frameZeros(
      toCells([
        [0, 0, 5],
        [0, 3, 4],
        [0, 2, 6],
      ]),
    );
    expect(isComplete(framed)).toBe(false);
    const marking = markLines(framed);
    expect(marking.min).toBe(2);
    expect(marking.matrix.flat().filter((c) => c.tone === 'uncovered-min')).toHaveLength(1);
  });
});

describe('solveAssignment', () => {
  it('solves a known min problem', () => {
    const solution = solveAssignment(
      [
        [4, 1, 3],
        [2, 0, 5],
        [3, 2, 2],
      ],
      'min',
    );
    expect(solution.total).toBe(5);
    expect(solution.assignments).toHaveLength(3);
  });

  it('reports max totals with the original values', () => {
    const values = [
      [10, 90],
      [80, 20],
    ];
    const solution = solveAssignment(values, 'max');
    expect(solution.total).toBe(170);
    expect(solution.assignments.map((a) => a.value).sort()).toEqual([80, 90]);
  });

  it.each(['min', 'max'] as const)('matches brute force on random matrices (%s)', (type) => {
    const rng = seeded(type === 'min' ? 42 : 7);
    for (let i = 0; i < 200; i++) {
      const size = 2 + (i % 5);
      const values = randomValues(size, rng);
      const solution = solveAssignment(values, type);
      const rows = new Set(solution.assignments.map((a) => a.from));
      const cols = new Set(solution.assignments.map((a) => a.to));
      expect(rows.size).toBe(size);
      expect(cols.size).toBe(size);
      expect(solution.total).toBe(bruteForce(values, type));
    }
  });

  it('stays optimal with many tied values (degenerate framings)', () => {
    const rng = seeded(11);
    for (let i = 0; i < 200; i++) {
      const size = 3 + (i % 4);
      const values = randomValues(size, () => Math.floor(rng() * 4) / 100);
      expect(solveAssignment(values, 'min').total).toBe(bruteForce(values, 'min'));
      expect(solveAssignment(values, 'max').total).toBe(bruteForce(values, 'max'));
    }
  });

  it('lower bound never exceeds the optimum (min)', () => {
    const rng = seeded(3);
    for (let i = 0; i < 50; i++) {
      const values = randomValues(5, rng);
      const solution = solveAssignment(values, 'min');
      expect(solution.stepOne.lowerBound).toBeLessThanOrEqual(solution.total);
    }
  });

  it('handles larger matrices (9x9) and many duplicate values', () => {
    const rng = seeded(99);
    for (let i = 0; i < 20; i++) {
      const values = randomValues(9, () => Math.floor(rng() * 4) / 100);
      expect(() => solveAssignment(values, 'min')).not.toThrow();
    }
  });
});
