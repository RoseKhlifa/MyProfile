import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const base = new URL(process.argv[2] ?? "http://127.0.0.1:4324/");
const response = await fetch(base);
assert.equal(response.status, 200);
const html = await response.text();
assert.ok(html.includes("RoseKhlifa"));
assert.ok(html.includes('data-theme="dark"'));
assert.ok(!html.includes("Bartosz Jarocki"), "Original author biography remains in rendered page");
const assets = [...new Set([...html.matchAll(/(?:src|href)="([^\"]+\.(?:js|css|woff2)(?:\?[^\"]*)?)"/g)].map(match => match[1]))].filter(path => path.startsWith("/_next/"));
assert.ok(assets.length > 2);
for (const asset of assets) {
  const result = await fetch(new URL(asset.replaceAll("&amp;", "&"), base));
  assert.equal(result.status, 200, asset);
  assert.ok((await result.arrayBuffer()).byteLength > 0);
}
const blog = await fetch("http://51.83.101.143:18180", { signal: AbortSignal.timeout(15000) });
assert.equal(blog.status, 200);
await blog.arrayBuffer();
const avatarResponse = await fetch(new URL("/avatar.jpg", base));
assert.equal(avatarResponse.status, 200);
const avatarHash = createHash("sha256").update(Buffer.from(await avatarResponse.arrayBuffer())).digest("hex");
assert.equal(avatarHash, "3bc776c93eaa1ac48c4f71406010040fe782a35061bc633645f48e90e2122056");
console.log(JSON.stringify({ status: "PASS", homepage: 200, assets: assets.length, blog: 200, avatar: "original-hash-match", originalBiography: false }));
