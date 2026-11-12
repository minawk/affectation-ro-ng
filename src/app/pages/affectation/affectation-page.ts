import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  Injector,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { form } from '@angular/forms/signals';
import { MAX_DIM, MIN_DIM, Solution } from '../../core/models/assignment.model';
import { AssignmentSolverError, solveAssignment } from '../../core/utils/hungarian-solver';
import { createColumnLabels, createRowLabels, createValues } from '../../core/utils/matrix.utils';
import { AssignmentGraph } from '../../components/assignment-graph/assignment-graph';
import { InputPanel } from '../../components/input-panel/input-panel';
import { Iteration } from '../../components/iteration/iteration';
import { StepOne } from '../../components/step-one/step-one';
import { AffectationInput, affectationSchema } from './affectation-form';

const DEFAULT_DIM = 6;
const RESULT_HEADING_ID = 'step-result';

type SolveResult = { solution: Solution; error: null } | { solution: null; error: string | null };

const stepHeadingId = (index: number) => `step-${index}`;

@Component({
  selector: 'app-affectation-page',
  imports: [InputPanel, StepOne, Iteration, AssignmentGraph],
  templateUrl: './affectation-page.html',
  styleUrl: './affectation-page.scss',
})
export class AffectationPage {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  private readonly model = signal<AffectationInput>({
    dim: DEFAULT_DIM,
    type: 'min',
    values: createValues(DEFAULT_DIM),
  });
  protected readonly form = form(this.model, affectationSchema);

  protected readonly size = computed(() => this.model().values.length);
  protected readonly colLabels = computed(() => createColumnLabels(this.size()));
  protected readonly rowLabels = computed(() => createRowLabels(this.size()));

  private readonly solveResult = computed<SolveResult>(() => {
    const { dim, type, values } = this.model();
    if (!this.form().valid() || values.length !== dim) return { solution: null, error: null };
    try {
      return { solution: solveAssignment(values as number[][], type), error: null };
    } catch (e) {
      if (e instanceof AssignmentSolverError) return { solution: null, error: e.message };
      throw e;
    }
  });
  protected readonly solution = computed(() => this.solveResult().solution);
  protected readonly solverError = computed(() => this.solveResult().error);

  /** Number of revealed steps; any input change resets the walkthrough. */
  protected readonly revealed = linkedSignal({ source: this.solveResult, computation: () => 0 });

  protected readonly iterationViews = computed(() => {
    const solution = this.solution();
    if (!solution) return [];
    let start = 2;
    return solution.iterations.map((iteration, i) => {
      const length = iteration.marking ? 3 : 1;
      const view = {
        iteration,
        number: i + 1,
        visible: Math.min(Math.max(this.revealed() - start + 1, 0), length),
        headingIds: [0, 1, 2].map((j) => stepHeadingId(start + j)),
      };
      start += length;
      return view;
    });
  });

  protected readonly totalSteps = computed(() => {
    const solution = this.solution();
    if (!solution) return 0;
    return 1 + solution.iterations.reduce((acc, it) => acc + (it.marking ? 3 : 1), 0);
  });

  protected readonly finished = computed(
    () => this.totalSteps() > 0 && this.revealed() >= this.totalSteps(),
  );
  protected readonly canCalculate = computed(() => !!this.solution() && !this.finished());
  protected readonly resultTitle = computed(() =>
    this.solution()?.type === 'max' ? 'Maximal' : 'Minimal',
  );
  protected readonly status = computed(() => {
    const solution = this.solution();
    if (!solution || this.revealed() === 0) return '';
    if (this.finished()) return `Calcul terminé, total ${solution.total}.`;
    return `Étape ${this.revealed()} sur ${this.totalSteps()} affichée.`;
  });

  protected readonly stepOneHeadingId = stepHeadingId(1);
  protected readonly resultHeadingId = RESULT_HEADING_ID;

  constructor() {
    // Changing the dimension resets the matrix (imports set both at once and are kept).
    effect(() => {
      const dim = this.model().dim;
      if (dim === null || !Number.isInteger(dim) || dim < MIN_DIM || dim > MAX_DIM) return;
      if (untracked(() => this.model().values.length) !== dim) {
        this.model.update((current) => ({ ...current, values: createValues(dim) }));
      }
    });
  }

  protected calculate(): void {
    if (!this.canCalculate()) return;
    this.revealed.update((n) => n + 1);
    const index = this.revealed();
    afterNextRender(
      {
        write: () => {
          this.document.getElementById(stepHeadingId(index))?.focus({ preventScroll: true });
          this.document
            .getElementById('outputs-end')
            ?.scrollIntoView({ block: 'end', behavior: 'smooth' });
        },
      },
      { injector: this.injector },
    );
  }
}
