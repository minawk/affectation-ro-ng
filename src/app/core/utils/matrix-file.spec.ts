import { describe, expect, it } from 'vitest';
import { INVALID_FILE_MESSAGE, parseMatrixFile, serializeMatrixFile } from './matrix-file';

describe('parseMatrixFile', () => {
  it('round-trips an exported matrix', () => {
    const content = {
      dim: 2,
      matrix: [
        [1, 2],
        [3, 4],
      ],
    };
    expect(parseMatrixFile(serializeMatrixFile(content))).toEqual(content);
  });

  it.each([
    'not json',
    'null',
    JSON.stringify({
      dim: 3,
      matrix: [
        [1, 2],
        [3, 4],
      ],
    }),
    JSON.stringify({ dim: 2, matrix: [[1, 2], [3]] }),
    JSON.stringify({
      dim: 2,
      matrix: [
        [1, 200],
        [3, 4],
      ],
    }),
    JSON.stringify({ dim: 1, matrix: [[1]] }),
    JSON.stringify({
      matrix: [
        [1, 2],
        [3, 4],
      ],
    }),
  ])('rejects invalid content %s', (text) => {
    expect(() => parseMatrixFile(text)).toThrow(INVALID_FILE_MESSAGE);
  });
});
