import { readdirSync } from "node:fs";
import net from "node:net";
import { spawn } from "node:child_process";

async function availablePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      const port = typeof address === "object" && address ? address.port : null;
      probe.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitUntilReady(url, children) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const stopped = children.find((child) => child.exitCode != null);
    if (stopped) throw new Error(`Next.js test server exited with code ${stopped.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // The production server is still starting; retry until the deadline.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("Next.js test server did not become ready within 30 seconds");
}

const frontendPort = await availablePort();
const backendPort = 3001;
if (!frontendPort) throw new Error("Could not reserve a local frontend test port");
const baseUrl = `http://127.0.0.1:${frontendPort}`;
const backendUrl = `http://127.0.0.1:${backendPort}`;
const nextBin = new URL("../node_modules/next/dist/bin/next", import.meta.url).pathname;
const backend = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(backendPort)], {
  cwd: new URL("../apps/backend", import.meta.url).pathname,
  env: {
    ...process.env,
    PORT: String(backendPort),
    FRONTEND_URL: baseUrl,
    DATABASE_URL: "",
  },
  stdio: ["ignore", "inherit", "inherit"],
});
const frontend = spawn(process.execPath, [nextBin, "start", "-H", "127.0.0.1", "-p", String(frontendPort)], {
  cwd: new URL("../apps/frontend", import.meta.url).pathname,
  env: { ...process.env, PORT: String(frontendPort), BACKEND_API_URL: backendUrl },
  stdio: ["ignore", "inherit", "inherit"],
});
const servers = [backend, frontend];

let exitCode = 1;
try {
  await waitUntilReady(`${backendUrl}/api/health`, servers);
  await waitUntilReady(baseUrl, servers);
  const testFiles = readdirSync("tests")
    .filter((file) => file.endsWith(".test.mjs"))
    .sort()
    .map((file) => `tests/${file}`);
  const runner = spawn(process.execPath, ["--test", ...testFiles], {
    cwd: process.cwd(),
    env: { ...process.env, TEST_BASE_URL: baseUrl },
    stdio: "inherit",
  });
  exitCode = await new Promise((resolve, reject) => {
    runner.once("error", reject);
    runner.once("exit", (code) => resolve(code ?? 1));
  });
} finally {
  await Promise.all(servers.map((server) => {
    if (server.exitCode != null) return Promise.resolve();
    return new Promise((resolve) => {
      server.once("exit", resolve);
      server.kill("SIGTERM");
    });
  }));
}

process.exit(exitCode);
