import { Component, computed, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

import { MatrixFileContent } from '../../core/assignment/matrix-file';
import { randomValues } from '../../core/assignment/matrix.utils';
import { AffectationInput } from '../../pages/affectation/affectation-form';
import { ImportExport } from '../import-export/import-export';
import { MatrixEditor } from '../matrix-editor/matrix-editor';

/** Problem definition: dimension, costs, min/max and file import/export. */
@Component({
  selector: 'app-input-panel',
  imports: [FormField, MatrixEditor, ImportExport],
  templateUrl: './input-panel.html',
  styleUrl: './input-panel.scss',
})
export class InputPanel {
  readonly form = input.required<FieldTree<AffectationInput>>();
  readonly colLabels = input.required<readonly string[]>();
  readonly rowLabels = input.required<readonly string[]>();

  protected readonly size = computed(() => this.form().values().value().length);
  protected readonly exportValues = computed(() =>
    this.form()
      .values()
      .value()
      .map((row) => row.map((v) => v ?? 0)),
  );

  protected fillRandom(): void {
    this.form().values().value.set(randomValues(this.size()));
  }

  protected onImported({ dim, matrix }: MatrixFileContent): void {
    this.form()().value.update((current) => ({ ...current, dim, values: matrix }));
  }
}
