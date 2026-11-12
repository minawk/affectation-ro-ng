import { Component, inject, input, output, signal } from '@angular/core';
import { MatrixFileContent } from '../../core/assignment/matrix-file';
import { MatrixFileService } from '../../core/assignment/matrix-file.service';

/** Imports / exports the matrix as `matrix.json`. */
@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.html',
  styleUrl: './import-export.scss',
})
export class ImportExport {
  private readonly files = inject(MatrixFileService);

  readonly dim = input.required<number>();
  readonly values = input.required<readonly (readonly number[])[]>();
  readonly canExport = input(true);
  readonly imported = output<MatrixFileContent>();

  protected readonly error = signal<string | null>(null);

  protected async onFileChange(event: Event): Promise<void> {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;
    try {
      const content = await this.files.import(file);
      this.error.set(null);
      this.imported.emit(content);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      fileInput.value = '';
    }
  }

  protected onExport(): void {
    this.error.set(null);
    this.files.export({ dim: this.dim(), matrix: this.values().map((row) => [...row]) });
  }
}
