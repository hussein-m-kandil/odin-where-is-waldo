import { Finder } from '../../finders/finders.types';
export type { Finder };

export interface Point {
  x: number;
  y: number;
}

export interface SelectedPoint {
  relative: Point;
  natural: Point;
}

export interface Placement {
  height: number;
  width: number;
  left: number;
  top: number;
}

export type Evaluation = Partial<Record<string, boolean>>;

export interface EvaluationResult {
  evaluation: Evaluation;
  finder: Finder;
}
