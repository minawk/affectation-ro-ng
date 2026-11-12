export type AssignmentType = 'min' | 'max';

/** Highlight applied to a cell during the marking step (Étape 3). */
export type CellTone = 'uncovered-min' | 'single' | 'double';

export interface Cell {
  readonly value: number;
  /** Zero selected as an assignment (encadré). */
  readonly framed: boolean;
  /** Zero discarded because of a framed zero in the same row/column (barré). */
  readonly crossed: boolean;
  readonly tone: CellTone | null;
}

export type CellMatrix = readonly (readonly Cell[])[];

export interface StepOneResult {
  readonly original: CellMatrix;
  readonly columnMins: readonly number[];
  readonly afterColumns: CellMatrix;
  readonly rowMins: readonly number[];
  readonly reduced: CellMatrix;
  readonly lowerBound: number;
}

export interface MarkingResult {
  readonly matrix: CellMatrix;
  readonly markedRows: readonly boolean[];
  readonly markedCols: readonly boolean[];
  readonly min: number;
}

export interface Iteration {
  readonly framing: CellMatrix;
  readonly marking: MarkingResult | null;
  readonly adjusted: CellMatrix | null;
}

export interface Assignment {
  /** Row index (source). */
  readonly from: number;
  /** Column index (destination). */
  readonly to: number;
  /** Value taken from the original (non inverted) matrix. */
  readonly value: number;
}

export interface Solution {
  readonly type: AssignmentType;
  readonly stepOne: StepOneResult;
  readonly iterations: readonly Iteration[];
  readonly assignments: readonly Assignment[];
  readonly total: number;
}

export const MIN_DIM = 2;
export const MAX_DIM = 9;
export const MIN_VALUE = 0;
export const MAX_VALUE = 99;
