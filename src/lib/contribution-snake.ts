import type { ContributionDay } from "./github-contributions";

export type SnakeStep = { date: string; meal: boolean };
type Tile = { date: string; x: number; y: number };
const DAY_MS = 86_400_000;
const DIRECTIONS = [
  [0, -1],
  [-1, 0],
  [0, 1],
  [1, 0],
];
export const SNAKE_LENGTH = 6;
export const SNAKE_STEP_MS = 165;
export const SNAKE_REST_MS = 9000;

/** A deterministic, adjacent-cell route visits real contribution days. */
export function createContributionSnake(days: ContributionDay[]): SnakeStep[] {
  if (days.length === 0) return [];
  const first = new Date(`${days[0].date}T00:00:00Z`);
  const start = first.getTime() - first.getUTCDay() * DAY_MS;
  const tiles = new Map<string, Tile>();
  for (const day of days) {
    const offset = Math.round(
      (Date.parse(`${day.date}T00:00:00Z`) - start) / DAY_MS
    );
    const tile = { date: day.date, x: Math.floor(offset / 7), y: offset % 7 };
    tiles.set(`${tile.x},${tile.y}`, tile);
  }
  const lookup = new Map([...tiles.values()].map((tile) => [tile.date, tile]));
  const food = new Set(
    days.filter((day) => day.count > 0).map((day) => day.date)
  );
  let head = lookup.get(days[days.length - 1].date) as Tile;
  const body = [head.date];
  const route: SnakeStep[] = [
    { date: head.date, meal: food.delete(head.date) },
  ];

  function neighbors(tile: Tile) {
    return DIRECTIONS.map(([x, y]) =>
      tiles.get(`${tile.x + x},${tile.y + y}`)
    ).filter((item): item is Tile => item !== undefined);
  }

  function move(tile: Tile) {
    head = tile;
    body.unshift(tile.date);
    if (body.length > SNAKE_LENGTH) body.pop();
    route.push({ date: tile.date, meal: food.delete(tile.date) });
  }

  while (food.size > 0 && route.length < days.length * 6) {
    // The tail vacates on the next tick once the snake has reached full length.
    const blocked = new Set(
      body.length === SNAKE_LENGTH ? body.slice(0, -1) : body
    );
    const queue = [head];
    const previous = new Map<string, Tile | null>([[head.date, null]]);
    let target: Tile | undefined;
    for (const current of queue) {
      if (food.has(current.date)) {
        target = current;
        break;
      }
      for (const next of neighbors(current)) {
        if (blocked.has(next.date) || previous.has(next.date)) continue;
        previous.set(next.date, current);
        queue.push(next);
      }
    }
    if (!target) {
      const next = neighbors(head).find((tile) => !blocked.has(tile.date));
      if (!next) break;
      move(next);
      continue;
    }
    const path: Tile[] = [];
    let cursor: Tile | null = target;
    while (cursor && cursor.date !== head.date) {
      path.push(cursor);
      cursor = previous.get(cursor.date) ?? null;
    }
    for (const tile of path.reverse()) move(tile);
  }
  return route;
}
