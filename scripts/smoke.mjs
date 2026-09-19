import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = await mkdtemp(path.join(os.tmpdir(), "skeleton-smoke-"));
const port = await reservePort();
const baseUrl = `http://127.0.0.1:${port}`;
const output = [];

const runtime = spawn(process.execPath, ["dist/apps/runtime/src/server.js"], {
  cwd: projectRoot,
  env: {
    ...process.env,
    PORT: String(port),
    SKELETON_PROJECT_ROOT: projectRoot,
    SKELETON_DATA_ROOT: dataRoot
  },
  stdio: ["ignore", "pipe", "pipe"]
});

runtime.stdout.on("data", (chunk) => output.push(String(chunk)));
runtime.stderr.on("data", (chunk) => output.push(String(chunk)));

try {
  const health = await waitForJson("/api/health");
  assert.equal(health.status, "ok");
  assert.equal(health.ready, true);
  assert.equal(health.containerCount, 7);
  assert.equal(health.environmentCount, 3);

  const bootstrap = await getJson("/api/framework/bootstrap");
  assert.equal(bootstrap.containers.length, 7);
  assert.equal(bootstrap.environments.length, 3);

  const packages = await getJson("/api/capability-platform/packages");
  assert.ok(Array.isArray(packages));
  assert.ok(packages.length >= 1);

  const agents = await getJson("/api/agents/definitions");
  assert.ok(Array.isArray(agents));

  const storage = await getJson("/api/storage/observability");
  assert.equal(typeof storage, "object");

  console.log("Skeleton smoke check passed.");
} finally {
  runtime.kill();
  await new Promise((resolve) => {
    if (runtime.exitCode !== null) {
      resolve();
      return;
    }
    runtime.once("exit", resolve);
    setTimeout(resolve, 3000).unref();
  });
  await rm(dataRoot, { recursive: true, force: true });
}

async function getJson(route) {
  const response = await fetch(`${baseUrl}${route}`);
  assert.equal(response.ok, true, `${route} returned ${response.status}`);
  return response.json();
}

async function waitForJson(route) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (runtime.exitCode !== null) {
      throw new Error(`Runtime exited early.\n${output.join("")}`);
    }
    try {
      return await getJson(route);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error(`Runtime did not become ready.\n${output.join("")}`);
}

async function reservePort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const selected = address.port;
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  return selected;
}
