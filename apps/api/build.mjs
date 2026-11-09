// Bundles the Vercel entry into server.mjs (run by Vercel as the `build` script).
// Vercel compiles .ts files one by one but keeps our `.ts` import specifiers, so
// they fail at runtime; a bundle has no relative imports left. Our own code and
// workspace packages (@squii/core) are inlined; npm dependencies stay external
// so Vercel installs and traces them normally (hono stays a real import, which
// the Hono preset looks for). Root-level server.mjs is a preset entry name.
import { readFileSync } from "node:fs";
import { build } from "esbuild";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const external = Object.entries(pkg.dependencies)
  .filter(([, version]) => !version.startsWith("workspace:"))
  .map(([name]) => name);

await build({
  entryPoints: ["src/vercel.ts"],
  outfile: "server.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  external,
  logLevel: "info",
});
