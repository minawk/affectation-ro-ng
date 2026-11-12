import { Component, computed, input } from '@angular/core';
import { Cell, CellMatrix } from '../../core/models/assignment.model';

/** Read-only display of a matrix with its optional margins (minimums or "+" marks). */
@Component({
  selector: 'app-matrix-table',
  templateUrl: './matrix-table.html',
  styleUrl: './matrix-table.scss',
})
export class MatrixTable {
  readonly matrix = input.required<CellMatrix>();
  readonly colLabels = input.required<readonly string[]>();
  readonly rowLabels = input.required<readonly string[]>();
  readonly caption = input.required<string>();
  /** Values shown under each column (e.g. column minimums). */
  readonly bottomValues = input<readonly number[] | null>(null);
  /** Values shown at the right of each row (e.g. row minimums). */
  readonly sideValues = input<readonly number[] | null>(null);
  readonly markedRows = input<readonly boolean[] | null>(null);
  readonly markedCols = input<readonly boolean[] | null>(null);
  readonly highlightZeros = input(false);

  protected readonly hasSide = computed(() => !!this.sideValues() || !!this.markedRows());
  protected readonly hasBottom = computed(() => !!this.bottomValues() || !!this.markedCols());
  protected readonly sideHeader = computed(() =>
    this.sideValues() ? 'Min ligne' : 'Marquage ligne',
  );
  protected readonly bottomHeader = computed(() =>
    this.bottomValues() ? 'Min colonne' : 'Marquage colonne',
  );

  protected sideText(y: number): string {
    const values = this.sideValues();
    if (values) return String(values[y]);
    return this.markedRows()?.[y] ? '+' : '';
  }

  protected bottomText(x: number): string {
    const values = this.bottomValues();
    if (values) return String(values[x]);
    return this.markedCols()?.[x] ? '+' : '';
  }

  protected stateText(cell: Cell): string {
    const states: string[] = [];
    if (cell.framed) states.push('encadré');
    if (cell.crossed) states.push('barré');
    if (cell.tone === 'uncovered-min') states.push('minimum non couvert');
    if (cell.tone === 'double') states.push('couvert deux fois');
    if (cell.tone === 'single') states.push('couvert');
    return states.join(', ');
  }
}
