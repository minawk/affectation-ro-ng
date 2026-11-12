import { applyEach, max, min, required, schema, validate } from '@angular/forms/signals';
import {
  AssignmentType,
  MAX_DIM,
  MAX_VALUE,
  MIN_DIM,
  MIN_VALUE,
} from '../../core/models/assignment.model';

export interface AffectationInput {
  dim: number | null;
  type: AssignmentType;
  values: (number | null)[][];
}

const integer =
  (label: string) =>
  ({ value }: { value: () => number | null }) => {
    const v = value();
    return v === null || Number.isInteger(v)
      ? null
      : { kind: 'integer', message: `${label} doit être un entier.` };
  };

const cellSchema = schema<number | null>((cell) => {
  required(cell, { message: 'Valeur requise.' });
  min(cell, MIN_VALUE, { message: `Valeur minimale ${MIN_VALUE}.` });
  max(cell, MAX_VALUE, { message: `Valeur maximale ${MAX_VALUE}.` });
  validate(cell, integer('La valeur'));
});

export const affectationSchema = schema<AffectationInput>((path) => {
  required(path.dim, { message: 'Dimension requise.' });
  min(path.dim, MIN_DIM, { message: `Dimension minimale ${MIN_DIM}.` });
  max(path.dim, MAX_DIM, { message: `Dimension maximale ${MAX_DIM}.` });
  validate(path.dim, integer('La dimension'));
  applyEach(path.values, (row) => applyEach(row, cellSchema));
});
