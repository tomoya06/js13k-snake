export type Pos = [number, number];

export function genRandomPos(width: number, height: number): Pos {
  return [
    Math.floor(width * Math.random()),
    Math.floor(height * Math.random()),
  ];
}
