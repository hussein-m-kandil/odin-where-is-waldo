export interface Point {
  x: number;
  y: number;
}

export interface SelectedPoint {
  relative: Point;
  absolute: Point;
  natural: Point;
}

export interface Placement {
  height: number;
  width: number;
  left: number;
  top: number;
}
