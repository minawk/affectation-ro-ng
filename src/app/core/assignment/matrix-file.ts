import { MAX_DIM, MAX_VALUE, MIN_DIM, MIN_VALUE } from './assignment.model';

export interface MatrixFileContent {
  readonly dim: number;
  readonly matrix: number[][];
}

export const INVALID_FILE_MESSAGE = 'Le contenu du fichier est invalide !';
export const READ_ERROR_MESSAGE = 'Erreur de lecture du fichier !';

const isValidValue = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= MIN_VALUE && v <= MAX_VALUE;

/** Validates the `{ dim, matrix }` JSON shape used by the export. */
export const parseMatrixFile = (text: string): MatrixFileContent => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(INVALID_FILE_MESSAGE);
  }
  if (typeof data !== 'object' || data === null) throw new Error(INVALID_FILE_MESSAGE);

  const { dim, matrix } = data as Record<string, unknown>;
  const validDim =
    typeof dim === 'number' && Number.isInteger(dim) && dim >= MIN_DIM && dim <= MAX_DIM;
  const validMatrix =
    validDim &&
    Array.isArray(matrix) &&
    matrix.length === dim &&
    matrix.every((row) => Array.isArray(row) && row.length === dim && row.every(isValidValue));

  if (!validMatrix) throw new Error(INVALID_FILE_MESSAGE);
  return { dim, matrix: matrix as number[][] };
};

export const serializeMatrixFile = (content: MatrixFileContent): string =>
  JSON.stringify(content, null, 2);
