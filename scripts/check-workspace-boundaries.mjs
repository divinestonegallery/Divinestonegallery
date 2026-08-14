import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx", ".mts", ".mjs"]);
const failures = [];

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const pathname = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === ".next" || entry.name === "node_modules") return [];
      return sourceFiles(pathname);
    }
    return sourceExtensions.has(extname(entry.name)) ? [pathname] : [];
  });
}

function reject(directory, rules) {
  for (const filename of sourceFiles(join(root, directory))) {
    const source = readFileSync(filename, "utf8");
    for (const [pattern, explanation] of rules) {
      if (pattern.test(source)) {
        failures.push(`${relative(root, filename)}: ${explanation}`);
      }
    }
  }
}

reject("apps/frontend", [
  [/@divine-stone\/database/, "frontend code must not import the database package"],
  [/@\/modules\//, "frontend code must not import backend modules"],
  [/apps\/backend/, "frontend code must not reach into the backend application"],
]);

reject("apps/backend", [
  [/@\/components\//, "backend code must not import frontend components"],
  [/@\/features\//, "backend code must not import frontend features"],
  [/apps\/frontend/, "backend code must not reach into the frontend application"],
]);

reject("packages/shared", [
  [/from\s+["'](?:next|react)(?:\/|["'])/, "shared contracts must remain framework-independent"],
  [/@divine-stone\/database/, "shared contracts must not depend on database code"],
]);

if (failures.length) {
  console.error("Workspace boundary check failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Workspace boundaries are clean.");
