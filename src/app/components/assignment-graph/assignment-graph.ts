import { Component, computed, input } from '@angular/core';
import { Assignment } from '../../core/assignment/assignment.model';

const PITCH = 45;

/** Bipartite graph of the final assignment (sources on the left, destinations on the right). */
@Component({
  selector: 'app-assignment-graph',
  templateUrl: './assignment-graph.html',
  styleUrl: './assignment-graph.scss',
})
export class AssignmentGraph {
  readonly title = input.required<string>();
  readonly assignments = input.required<readonly Assignment[]>();
  readonly total = input.required<number>();
  readonly colLabels = input.required<readonly string[]>();
  readonly rowLabels = input.required<readonly string[]>();
  readonly headingId = input.required<string>();

  protected readonly height = computed(() => this.assignments().length * PITCH);
  protected readonly nodes = computed(() =>
    this.assignments().map((_, i) => ({ cy: 20 + PITCH * i, textY: 27 + PITCH * i })),
  );
  protected readonly edges = computed(() =>
    this.assignments().map((a, i) => ({
      id: `assignment-path-${i}`,
      d: `M 65 ${20 + a.from * PITCH} l 170 ${(a.to - a.from) * PITCH}`,
      value: a.value,
    })),
  );
  protected readonly description = computed(
    () =>
      this.assignments()
        .map((a) => `${this.rowLabels()[a.from]} vers ${this.colLabels()[a.to]} : ${a.value}`)
        .join(', ') + `. Total ${this.total()}.`,
  );
}
