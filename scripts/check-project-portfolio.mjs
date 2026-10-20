import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { PROJECT_CATALOG } from "../src/data/projects.ts";

const response = await fetch("http://127.0.0.1:4324/");
assert.equal(response.status, 200);
const html = await response.text();
const articles = (html.match(/<article[^>]*>/g) ?? []).filter(tag=>tag.includes("cv-project-item"));
assert.equal(articles.length, 16);
assert.equal(articles.filter(tag=>tag.includes("hidden=")).length, 10);
for (const project of PROJECT_CATALOG) assert.ok(html.includes(project.title), project.title);
const current = readFileSync(new URL("./verify.mjs",import.meta.url),"utf8");
assert.equal(createHash("sha256").update(current.slice(current.indexOf("const checks = ["))).digest("hex"),"0e50cb2cd0b49deb682062cdef8763a933c410ec70b7469d12bf528316039de6");
console.log(JSON.stringify({http:200,renderedProjects:16,initiallyVisible:6,initiallyHidden:10,originalAssertions:"unchanged"}));
