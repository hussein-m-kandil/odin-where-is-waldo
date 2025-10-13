export interface Point {
  x: number;
  y: number;
}

export interface SelectedPoint {
  relative: Point;
  absolute: Point;
  natural: Point;
}
