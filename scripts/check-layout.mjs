import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const page = readFileSync(join(root, "src/app/page.tsx"), "utf8");
const header = readFileSync(join(root, "src/app/components/header.tsx"), "utf8");
const projects = readFileSync(join(root, "src/app/components/projects.tsx"), "utf8");
const section = readFileSync(join(root, "src/components/ui/section.tsx"), "utf8");
const wide = page.includes("mx-auto w-full max-w-5xl space-y-8 print:max-w-none print:space-y-3");
assert.ok(wide || page.includes("mx-auto w-full max-w-2xl space-y-8 print:max-w-none print:space-y-3"), "Expected approved main column and original32px section spacing");
assert.ok(page.includes("container relative mx-auto scroll-my-12 overflow-auto p-4 print:p-0 md:p-16"), "Original page padding changed");
assert.ok(header.includes("font-pixel text-[28px] leading-none sm:text-[32px]"), "Original name typography changed");
const originalGrid = projects.includes("grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-4");
const polishedGrid = projects.includes("grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 print:grid-cols-3 print:gap-4");
assert.ok(originalGrid || polishedGrid, "Expected original grid or approved two-column project previews");
assert.ok(section.includes("flex min-h-0 flex-col gap-y-3 print:gap-y-1"), "Original section rhythm changed");
assert.ok(section.includes("text-sm lowercase leading-[1.4] text-muted-foreground print:leading-tight"), "Original section heading changed");
console.log(JSON.stringify({ layout: "A1-core", columnPx: wide ? 1024 : 672, sectionGapPx: 32, nameFont: "GeistPixelSquare", nameSizePx: [28,32], projectColumns: polishedGrid ? 2 : 3, motion: page.includes("<Reveal") }));
