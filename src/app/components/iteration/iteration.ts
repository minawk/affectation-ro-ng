import { Component, input } from '@angular/core';
import { Iteration as IterationModel } from '../../core/models/assignment.model';
import { MatrixTable } from '../matrix-table/matrix-table';

/** One iteration of Étapes 2, 3 and 4; only the first `visible` sub-steps are shown. */
@Component({
  selector: 'app-iteration',
  imports: [MatrixTable],
  templateUrl: './iteration.html',
  styleUrl: './iteration.scss',
})
export class Iteration {
  readonly iteration = input.required<IterationModel>();
  /** 1-based iteration number. */
  readonly number = input.required<number>();
  readonly visible = input.required<number>();
  readonly colLabels = input.required<readonly string[]>();
  readonly rowLabels = input.required<readonly string[]>();
  /** Heading ids for Étapes 2, 3 and 4, used for focus management. */
  readonly headingIds = input.required<readonly string[]>();
}
