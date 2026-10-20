import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const HOUR = 3_600_000;
const snapshot = JSON.parse(
  readFileSync(
    new URL("../src/data/github-contributions.snapshot.json", import.meta.url),
    "utf8"
  )
);
const hookPath = new URL(
  "../src/components/motion/use-contribution-calendar.ts",
  import.meta.url
);
const hook = stripTypeScriptTypes(readFileSync(hookPath, "utf8"), {
  mode: "strip",
})
  .replace(/^import \{ useEffect, useState \} from "react";\r?\n/m, "")
  .replace(/^export function /m, "function ");
const program = new vm.Script(
  `${hook}\nglobalThis.mount = useContributionCalendar;`,
  { filename: hookPath.pathname }
);
const settle = () => new Promise((resolve) => setImmediate(resolve));
const copy = (value) => structuredClone(value);

function fresh(increment = 1, source = "live") {
  const calendar = copy(snapshot);
  calendar.fetchedAt = new Date(
    Date.parse(snapshot.fetchedAt) + increment * 1000
  ).toISOString();
  calendar.days.at(-1).count += increment;
  calendar.days.at(-1).level = 1;
  calendar.total += increment;
  return { calendar, source };
}

function harness(hidden = false) {
  let now = Date.parse(snapshot.fetchedAt) + HOUR;
  let nextTimer = 0;
  let state;
  let effect;
  let cleanup;
  let writes = 0;
  const timers = new Map();
  const listeners = new Set();
  const plans = [];
  const calls = [];
  const document = {
    hidden,
    addEventListener: (_, callback) => listeners.add(callback),
    removeEventListener: (_, callback) => listeners.delete(callback),
  };
  class ClockDate extends Date {
    static now() {
      return now;
    }
  }
  const context = vm.createContext({
    Date: ClockDate,
    AbortController,
    document,
    window: {
      setTimeout(callback, delay) {
        const id = ++nextTimer;
        timers.set(id, { callback, at: now + delay });
        return id;
      },
      clearTimeout: (id) => timers.delete(id),
    },
    useState(initial) {
      state = initial;
      return [
        state,
        (update) => {
          state = typeof update === "function" ? update(state) : update;
          writes++;
        },
      ];
    },
    useEffect: (callback) => {
      effect = callback;
    },
    fetch: async (url, options) => {
      assert.equal(url, "/api/contributions");
      const call = { signal: options.signal };
      calls.push(call);
      const plan = plans.shift() ?? fresh();
      if (plan === "network") throw new Error("fixture: offline");
      if (plan === "pending") {
        return new Promise((_, reject) => {
          options.signal.addEventListener(
            "abort",
            () => {
              reject(new Error("fixture: aborted"));
            },
            { once: true }
          );
        });
      }
      return {
        ok: plan !== "http-error",
        json: async () => {
          if (plan === "bad-json")
            throw new SyntaxError("fixture: invalid JSON");
          return copy(plan);
        },
      };
    },
  });
  program.runInContext(context);
  return {
    calls,
    plans,
    timers,
    listeners,
    get result() {
      return state;
    },
    get writes() {
      return writes;
    },
    async mount() {
      context.mount(copy(snapshot), "snapshot");
      cleanup = effect();
      await settle();
    },
    async visibility(value) {
      document.hidden = value;
      for (const callback of listeners) callback();
      await settle();
    },
    async advance(duration) {
      const until = now + duration;
      let ticks = 0;
      while (true) {
        const due = [...timers]
          .filter(([, timer]) => timer.at <= until)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) break;
        assert(++ticks < 100, "timer scheduling must converge");
        now = due[1].at;
        timers.delete(due[0]);
        due[1].callback();
        await settle();
      }
      now = until;
      await settle();
    },
    async unmount() {
      cleanup();
      await settle();
      assert.equal(timers.size, 0, "unmount clears all timers");
      assert.equal(listeners.size, 0, "unmount removes visibility listener");
    },
    hideAndShowBeforeAbortSettles() {
      document.hidden = true;
      for (const callback of listeners) callback();
      document.hidden = false;
      for (const callback of listeners) callback();
    },
  };
}

const regular = harness();
await regular.mount();
assert.equal(regular.calls.length, 1);
assert.equal(regular.result.calendar.total, snapshot.total + 1);
await regular.advance(HOUR - 1);
await regular.visibility(false);
assert.equal(regular.calls.length, 1, "focus before one hour must not refetch");
regular.plans.push(fresh(2));
await regular.advance(1);
assert.equal(regular.calls.length, 2);
assert.equal(regular.result.calendar.total, snapshot.total + 2);
await regular.unmount();
console.log(
  "ok visible mount fetches once; no early duplicate; hourly refresh updates calendar"
);

const background = harness(true);
await background.mount();
await background.advance(HOUR);
assert.equal(background.calls.length, 0, "hidden mount does not fetch");
await background.visibility(false);
assert.equal(background.calls.length, 1);
await background.visibility(true);
await background.advance(2 * HOUR);
assert.equal(background.calls.length, 1, "hidden page never polls");
background.plans.push(fresh(3));
await background.visibility(false);
assert.equal(background.calls.length, 2);
assert.equal(background.result.calendar.total, snapshot.total + 3);
await background.unmount();
console.log(
  "ok hidden mount and background pause; overdue foreground return refreshes"
);

const resilient = harness();
resilient.plans.push(fresh(10));
await resilient.mount();
const retained = resilient.result;
const invalidFields = fresh(11);
invalidFields.calendar.days = [{ date: "broken", count: 0, level: 0 }];
const oldRange = fresh(20);
oldRange.calendar.days.pop();
oldRange.calendar.to = oldRange.calendar.days.at(-1).date;
oldRange.calendar.total = oldRange.calendar.days.reduce(
  (sum, day) => sum + day.count,
  0
);
for (const failure of [
  "network",
  "http-error",
  "bad-json",
  invalidFields,
  fresh(2),
  fresh(2, "snapshot"),
  oldRange,
]) {
  resilient.plans.push(failure);
  await resilient.advance(HOUR);
  assert.equal(
    resilient.result,
    retained,
    "failed or stale response preserves current state"
  );
  const count = resilient.calls.length;
  await resilient.visibility(false);
  assert.equal(resilient.calls.length, count, "failure waits until next hour");
}
await resilient.unmount();
console.log(
  "ok network, HTTP, bad JSON, invalid fields and older live/snapshot responses retain valid data"
);

const race = harness();
race.plans.push("pending");
await race.mount();
race.hideAndShowBeforeAbortSettles();
assert.equal(
  race.calls.length,
  1,
  "rapid foreground return must not overlap requests"
);
await settle();
assert.equal(race.calls[0].signal.aborted, true);
await race.advance(HOUR);
assert.equal(
  race.calls.length,
  2,
  "aborted request finally restores the hourly timer"
);
await race.unmount();
console.log(
  "ok hide/abort/immediate-show race keeps one request and restores scheduling"
);

const pending = harness();
pending.plans.push("pending");
await pending.mount();
const writesBeforeUnmount = pending.writes;
await pending.unmount();
assert.equal(pending.calls[0].signal.aborted, true);
await pending.advance(2 * HOUR);
assert.equal(pending.calls.length, 1);
assert.equal(pending.writes, writesBeforeUnmount);
console.log(
  "ok unmount aborts pending fetch, removes listeners/timers and prevents later state writes"
);
console.log("PASS contribution refresh lifecycle");
