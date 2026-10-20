import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { PROJECT_CATALOG } from "../src/data/projects.ts";
import { INTERESTS, STACK_GROUPS } from "../src/data/stack.ts";

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier === "@/data/projects") return nextResolve(new URL("../src/data/projects.ts", import.meta.url).href, context);
  return nextResolve(specifier, context);
} });
const { getProjectCatalog } = await import("../src/lib/project-stars.ts");
assert.equal(PROJECT_CATALOG.length, 16);
assert.equal(new Set(PROJECT_CATALOG.map(p=>p.id)).size,16);
assert.equal(new Set(PROJECT_CATALOG.map(p=>p.title)).size,16);
const counts = Object.fromEntries(["services","creative","automation","experiments","personal"].map(c=>[c,PROJECT_CATALOG.filter(p=>p.category===c).length]));
assert.deepEqual(counts,{services:5,creative:2,automation:4,experiments:3,personal:2});
assert.equal(new Set(PROJECT_CATALOG.filter(p=>p.cover).map(p=>p.cover)).size,14);
for (const project of PROJECT_CATALOG) {
  assert.ok(project.details && project.highlights.length===3,project.id);
  if(project.link) assert.ok(["http:","https:"].includes(new URL(project.link).protocol));
  if(project.repository) { assert.ok(Number.isSafeInteger(project.stars)); assert.ok(Number.isFinite(Date.parse(project.starsUpdatedAt))); }
  else assert.equal(project.stars,undefined,"unknown stars are not zero");
}
assert.equal(PROJECT_CATALOG.filter(p=>p.repository).length,9);
assert.equal(PROJECT_CATALOG.find(p=>p.id==="homepage").repository,"https://github.com/RoseKhlifa/MyProfile");
assert.equal(PROJECT_CATALOG.find(p=>p.id==="myblog").stars,0);
assert.equal(PROJECT_CATALOG.find(p=>p.id==="4icode").status,"筹划中");
assert.equal(PROJECT_CATALOG.find(p=>p.id==="terminal-farm").status,"已停服");
assert.equal(PROJECT_CATALOG.find(p=>p.id==="image-studio").link,"https://github.com/RoseKhlifa/Image-Studio/releases");
assert.ok(PROJECT_CATALOG.find(p=>p.id==="xxt-mini").accessNote.includes("豆印 - 拼豆图纸转换"));
const tech=STACK_GROUPS.flatMap(group=>group.items.map(item=>item.name));
for(const name of ["Go","Python","PHP","Vue","Wails","Playwright","C++"]) assert.ok(tech.includes(name),name);
for(const name of ["Crypto","Vibe Coding","Web3","抓包与协议分析","逆向工程","AI 应用"]) assert.ok(INTERESTS.includes(name));
console.log(JSON.stringify({catalog:16,categories:counts,covers:14,publicRepositories:9,stack:tech.length,interests:INTERESTS.length}));

const originalFetch=globalThis.fetch;
try {
  globalThis.fetch=async()=>{throw new Error("offline");};
  assert.deepEqual(await getProjectCatalog(),PROJECT_CATALOG);
  let requests=0;
  globalThis.fetch=async(url,options)=>{
    requests++;
    assert.equal(options.next.revalidate,86400);
    assert.ok(!options.headers.Authorization);
    const current=PROJECT_CATALOG.find(p=>p.repository && new URL(p.repository).pathname===new URL(url).pathname.replace(/^\/repos/,""));
    assert.ok(current);
    return Response.json({private:false,stargazers_count:current.stars+1},{headers:{Date:"Tue, 20 Oct 2026 05:00:00 GMT"}});
  };
  const updated=await getProjectCatalog();
  assert.equal(requests,9);
  updated.forEach((project,i)=>assert.equal(project.stars,PROJECT_CATALOG[i].repository ? PROJECT_CATALOG[i].stars+1 : undefined));
  globalThis.fetch=async()=>Response.json({private:true,stargazers_count:9000});
  assert.deepEqual(await getProjectCatalog(),PROJECT_CATALOG);
  globalThis.fetch=async()=>new Response("rate limited",{status:403});
  assert.deepEqual(await getProjectCatalog(),PROJECT_CATALOG);
  console.log("PASS daily public stars refresh, zero-star display data and offline/rate-limit/private-response fallback");
} finally {globalThis.fetch=originalFetch;}
