import {
  Assignment,
  AssignmentType,
  Cell,
  CellMatrix,
  Iteration,
  MarkingResult,
  Solution,
  StepOneResult,
} from '../models/assignment.model';
import { columnMins, invertForMax, rowMins, toCell, toCells } from './matrix.utils';

export const MAX_ITERATIONS = 50;

export class AssignmentSolverError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssignmentSolverError';
  }
}

const isFree = (cell: Cell): boolean => cell.value === 0 && !cell.framed && !cell.crossed;

const clearMarks = (matrix: CellMatrix): CellMatrix =>
  matrix.map((row) => row.map((c) => toCell(c.value)));

/**
 * Étape 1: subtract each column minimum, then each row minimum.
 * The sum of all minimums is a lower bound of the optimal cost.
 */
export const reduceMatrix = (values: readonly (readonly number[])[]): StepOneResult => {
  const colMins = columnMins(values);
  const afterColumnValues = values.map((row) => row.map((v, x) => v - colMins[x]));
  const rMins = rowMins(afterColumnValues);
  const reducedValues = afterColumnValues.map((row, y) => row.map((v) => v - rMins[y]));
  const sum = (list: readonly number[]) => list.reduce((acc, v) => acc + v, 0);

  return {
    original: toCells(values),
    columnMins: colMins,
    afterColumns: toCells(afterColumnValues),
    rowMins: rMins,
    reduced: toCells(reducedValues),
    lowerBound: sum(colMins) + sum(rMins),
  };
};

/**
 * The greedy framing may miss a maximum set of independent zeros (ties), which
 * would make Étape 3 cover everything. Improve it with augmenting paths over
 * zero cells; when greedy is already maximal, nothing changes.
 * Every non framed zero ends up crossed.
 */
const completeFraming = (matrix: readonly (readonly Cell[])[]): CellMatrix => {
  const size = matrix.length;
  const rowOfCol: number[] = Array.from({ length: size }, () => -1);
  const colOfRow: number[] = Array.from({ length: size }, () => -1);
  matrix.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell.framed) {
        rowOfCol[x] = y;
        colOfRow[y] = x;
      }
    }),
  );

  const augment = (y: number, visited: boolean[]): boolean => {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x].value !== 0 || visited[x]) continue;
      visited[x] = true;
      if (rowOfCol[x] < 0 || augment(rowOfCol[x], visited)) {
        rowOfCol[x] = y;
        colOfRow[y] = x;
        return true;
      }
    }
    return false;
  };

  for (let y = 0; y < size; y++) {
    if (colOfRow[y] < 0)
      augment(
        y,
        Array.from({ length: size }, () => false),
      );
  }

  return matrix.map((row, y) =>
    row.map((cell, x) => {
      const framed = colOfRow[y] === x;
      return toCell(cell.value, { framed, crossed: cell.value === 0 && !framed });
    }),
  );
};

/**
 * Étape 2: repeatedly pick the row with the fewest free zeros, frame its first
 * free zero and cross every other zero of the same row and column.
 */
export const frameZeros = (input: CellMatrix): CellMatrix => {
  const matrix: Cell[][] = clearMarks(input).map((row) => [...row]);

  for (;;) {
    let bestRow = -1;
    let bestCount = Number.POSITIVE_INFINITY;
    matrix.forEach((row, y) => {
      const count = row.filter(isFree).length;
      if (count > 0 && count < bestCount) {
        bestCount = count;
        bestRow = y;
      }
    });
    if (bestRow < 0) return completeFraming(matrix);

    const y = bestRow;
    const x = matrix[y].findIndex(isFree);
    matrix[y][x] = { ...matrix[y][x], framed: true };
    matrix.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const sameLine = (rowIndex === y) !== (colIndex === x);
        if (sameLine && cell.value === 0 && !cell.framed) {
          matrix[rowIndex][colIndex] = { ...cell, crossed: true };
        }
      });
    });
  }
};

export const isComplete = (framed: CellMatrix): boolean =>
  framed.every((row) => row.some((c) => c.framed));

/**
 * Étape 3: mark rows without framed zero, then columns having a crossed zero
 * in a marked row, then rows having a framed zero in a marked column, until stable.
 * Covered lines are unmarked rows and marked columns.
 */
export const markLines = (framed: CellMatrix): MarkingResult => {
  const size = framed.length;
  const markedRows = framed.map((row) => !row.some((c) => c.framed));
  const markedCols: boolean[] = Array.from({ length: size }, () => false);

  let changed = true;
  while (changed) {
    changed = false;
    framed.forEach((row, y) => {
      if (!markedRows[y]) return;
      row.forEach((cell, x) => {
        if (cell.crossed && !markedCols[x]) {
          markedCols[x] = true;
          changed = true;
        }
      });
    });
    framed.forEach((row, y) => {
      if (markedRows[y]) return;
      if (row.some((cell, x) => cell.framed && markedCols[x])) {
        markedRows[y] = true;
        changed = true;
      }
    });
  }

  let min = Number.POSITIVE_INFINITY;
  let minAt: { x: number; y: number } | null = null;
  const matrix: Cell[][] = framed.map((row, y) =>
    row.map((cell, x) => {
      if (!markedRows[y]) {
        return toCell(cell.value, { tone: markedCols[x] ? 'double' : 'single' });
      }
      if (markedCols[x]) return toCell(cell.value, { tone: 'single' });
      if (cell.value < min) {
        min = cell.value;
        minAt = { x, y };
      }
      return toCell(cell.value);
    }),
  );

  if (minAt === null || min <= 0) {
    throw new AssignmentSolverError('Impossible de trouver un minimum non couvert.');
  }
  const { x, y } = minAt;
  matrix[y][x] = { ...matrix[y][x], tone: 'uncovered-min' };

  return { matrix, markedRows, markedCols, min };
};

/**
 * Étape 4: subtract the minimum from uncovered cells and add it to the cells
 * covered twice; the other cells stay unchanged.
 */
export const adjustMatrix = (marking: MarkingResult): CellMatrix =>
  marking.matrix.map((row, y) =>
    row.map((cell, x) => {
      const rowCovered = !marking.markedRows[y];
      const colCovered = marking.markedCols[x];
      if (rowCovered && colCovered) return toCell(cell.value + marking.min);
      if (!rowCovered && !colCovered) return toCell(cell.value - marking.min);
      return toCell(cell.value);
    }),
  );

export const solveAssignment = (
  values: readonly (readonly number[])[],
  type: AssignmentType,
): Solution => {
  const working = type === 'max' ? invertForMax(values) : values.map((row) => [...row]);
  const stepOne = reduceMatrix(working);

  const iterations: Iteration[] = [];
  let current = stepOne.reduced;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const framing = frameZeros(current);
    if (isComplete(framing)) {
      iterations.push({ framing, marking: null, adjusted: null });
      const assignments: Assignment[] = [];
      framing.forEach((row, y) =>
        row.forEach((cell, x) => {
          if (cell.framed) assignments.push({ from: y, to: x, value: values[y][x] });
        }),
      );
      const total = assignments.reduce((acc, a) => acc + a.value, 0);
      return { type, stepOne, iterations, assignments, total };
    }
    const marking = markLines(framing);
    const adjusted = adjustMatrix(marking);
    iterations.push({ framing, marking, adjusted });
    current = adjusted;
  }

  throw new AssignmentSolverError(`Aucune solution trouvée après ${MAX_ITERATIONS} itérations.`);
};
