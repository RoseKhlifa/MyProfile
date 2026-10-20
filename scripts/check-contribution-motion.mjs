import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContributionSnake, SNAKE_LENGTH } from "../src/lib/contribution-snake.ts";

const calendar = JSON.parse(readFileSync(new URL("../src/data/github-contributions.snapshot.json", import.meta.url), "utf8"));
const original = JSON.stringify(calendar.days);
const route = createContributionSnake(calendar.days);
const byDate = new Map(calendar.days.map((day) => [day.date, day]));
const start = Date.parse(`${calendar.from}T00:00:00Z`);
const weekday = new Date(start).getUTCDay();
const point = (date) => {
  const offset = (Date.parse(`${date}T00:00:00Z`) - start) / 86400000 + weekday;
  return [Math.floor(offset / 7), offset % 7];
};
const body = [];
const meals = new Set();
for (const [index, step] of route.entries()) {
  assert.ok(byDate.has(step.date), "snake remains inside actual calendar dates");
  if (index > 0) {
    const a = point(route[index - 1].date);
    const b = point(step.date);
    assert.equal(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]), 1, "each move joins adjacent cells");
  }
  if (body.length === SNAKE_LENGTH) body.pop();
  assert.ok(!body.includes(step.date), "snake avoids its current body");
  body.unshift(step.date);
  if (step.meal) {
    assert.ok(byDate.get(step.date).count > 0, "meals are real contributions");
    assert.ok(!meals.has(step.date), "a contribution lights only once per pass");
    meals.add(step.date);
  }
}
assert.equal(meals.size, calendar.days.filter((day) => day.count > 0).length, "visits every active day in the real snapshot");
assert.equal(JSON.stringify(calendar.days), original, "contribution counts and levels are unchanged");
assert.deepEqual(createContributionSnake([]), []);
assert.equal(createContributionSnake(calendar.days.map((day) => ({ ...day, count: 0, level: 0 }))).length, 1, "an empty year stays still");
assert.ok(route.length < calendar.days.length * 6, "route is bounded");
console.log(JSON.stringify({status:"PASS",steps:route.length,activeDays:meals.size,adjacent:true,selfCollision:false,calendarUnchanged:true,emptyYear:"static"}));
