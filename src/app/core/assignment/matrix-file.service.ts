import { DOCUMENT } from '@angular/common';
import { inject, Service } from '@angular/core';
import {
  MatrixFileContent,
  parseMatrixFile,
  READ_ERROR_MESSAGE,
  serializeMatrixFile,
} from './matrix-file';

/** Imports and exports the input matrix as a JSON file. */
@Service()
export class MatrixFileService {
  private readonly document = inject(DOCUMENT);

  export(content: MatrixFileContent, fileName = 'matrix.json'): void {
    const view = this.document.defaultView;
    if (!view) return;
    const blob = new Blob([serializeMatrixFile(content)], { type: 'application/json' });
    const url = view.URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    view.URL.revokeObjectURL(url);
  }

  async import(file: File): Promise<MatrixFileContent> {
    let text: string;
    try {
      text = await file.text();
    } catch {
      throw new Error(READ_ERROR_MESSAGE);
    }
    return parseMatrixFile(text);
  }
}
