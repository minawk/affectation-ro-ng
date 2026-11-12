import { Component, input } from '@angular/core';
import { StepOneResult } from '../../core/assignment/assignment.model';
import { MatrixTable } from '../matrix-table/matrix-table';

/** Étape 1: column and row reductions with the lower bound of the cost. */
@Component({
  selector: 'app-step-one',
  imports: [MatrixTable],
  templateUrl: './step-one.html',
  styleUrl: './step-one.scss',
})
export class StepOne {
  readonly result = input.required<StepOneResult>();
  readonly colLabels = input.required<readonly string[]>();
  readonly rowLabels = input.required<readonly string[]>();
  readonly headingId = input.required<string>();
}
