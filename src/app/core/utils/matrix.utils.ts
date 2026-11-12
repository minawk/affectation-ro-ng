import { Cell, CellMatrix, MAX_VALUE } from '../models/assignment.model';

/** Column labels: 1..n (destinations). */
export const createColumnLabels = (size: number): string[] =>
  Array.from({ length: size }, (_, i) => String(i + 1));

/** Row labels: A..Z (sources). */
export const createRowLabels = (size: number): string[] =>
  Array.from({ length: size }, (_, i) => String.fromCharCode(65 + i));

export const createValues = (size: number, fill = 0): number[][] =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => fill));

export const randomValues = (size: number, rng: () => number = Math.random): number[][] =>
  Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.floor(rng() * (MAX_VALUE + 1))),
  );

/** Max problem is solved as a min problem on `100 - v`. */
export const invertForMax = (values: readonly (readonly number[])[]): number[][] =>
  values.map((row) => row.map((v) => Math.abs(100 - v)));

export const columnMins = (values: readonly (readonly number[])[]): number[] =>
  values[0].map((_, x) => Math.min(...values.map((row) => row[x])));

export const rowMins = (values: readonly (readonly number[])[]): number[] =>
  values.map((row) => Math.min(...row));

export const toCell = (value: number, patch: Partial<Cell> = {}): Cell => ({
  value,
  framed: false,
  crossed: false,
  tone: null,
  ...patch,
});

export const toCells = (values: readonly (readonly number[])[]): CellMatrix =>
  values.map((row) => row.map((v) => toCell(v)));

export const toValues = (matrix: CellMatrix): number[][] =>
  matrix.map((row) => row.map((c) => c.value));
