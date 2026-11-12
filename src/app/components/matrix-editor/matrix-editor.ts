import { Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

/** Editable grid of the input matrix. */
@Component({
  selector: 'app-matrix-editor',
  imports: [FormField],
  templateUrl: './matrix-editor.html',
  styleUrl: './matrix-editor.scss',
})
export class MatrixEditor {
  readonly values = input.required<FieldTree<(number | null)[][]>>();
  readonly colLabels = input.required<readonly string[]>();
  readonly rowLabels = input.required<readonly string[]>();

  /** An emptied cell becomes 0 when leaving it (same as the original app). */
  protected fillEmpty(cell: FieldTree<number | null>): void {
    const state = cell();
    if (state.value() === null) state.value.set(0);
  }
}
