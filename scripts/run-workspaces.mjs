import { spawn } from "node:child_process";

const mode = process.argv[2];
if (!new Set(["dev", "build", "start"]).has(mode)) {
  throw new Error("Usage: node scripts/run-workspaces.mjs <dev|build|start>");
}

const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:3000";
const backendApiUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:3001";
const environment = {
  ...process.env,
  FRONTEND_URL: frontendUrl,
  BACKEND_API_URL: backendApiUrl,
};

function runWorkspace(workspace, script) {
  return spawn("npm", ["run", script, "--workspace", workspace], {
    env: environment,
    stdio: "inherit",
  });
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code: code ?? 1, signal }));
  });
}

if (mode === "build") {
  for (const workspace of ["@divine-stone/backend", "@divine-stone/frontend"]) {
    const result = await waitForExit(runWorkspace(workspace, "build"));
    if (result.code !== 0) process.exit(result.code);
  }
  process.exit(0);
}

const children = [
  runWorkspace("@divine-stone/backend", mode),
  runWorkspace("@divine-stone/frontend", mode),
];

function stopChildren(signal = "SIGTERM") {
  for (const child of children) {
    if (child.exitCode == null) child.kill(signal);
  }
}

process.once("SIGINT", () => stopChildren("SIGINT"));
process.once("SIGTERM", () => stopChildren("SIGTERM"));

const firstExit = await Promise.race(children.map(waitForExit));
stopChildren();
process.exit(firstExit.code);
