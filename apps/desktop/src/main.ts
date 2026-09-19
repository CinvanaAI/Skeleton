import { app, BrowserWindow, ipcMain, shell } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../../../..");
const dataRoot = path.join(app.getPath("userData"), "skeleton-data");
const runtimeEntry = path.join(projectRoot, "dist", "apps", "runtime", "src", "server.js");

let runtimeProcess: ChildProcess | null = null;

ipcMain.handle("framework:get-platform-roots", () => ({
  workspaceRoot: projectRoot,
  dataRoot
}));

ipcMain.handle("framework:open-path", async (_event: unknown, target: string) => {
  return shell.openPath(target);
});

app.whenReady().then(async () => {
  mkdirSync(dataRoot, { recursive: true });
  runtimeProcess = spawn(process.platform === "win32" ? "node.exe" : "node", [runtimeEntry], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: "4310",
      SKELETON_PROJECT_ROOT: projectRoot,
      SKELETON_DATA_ROOT: dataRoot,
      SKELETON_REBUILD_DESKTOP: "1"
    },
    stdio: "inherit"
  });

  await waitForRuntime();

  const window = new BrowserWindow({
    width: 1480,
    height: 960,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: "#f4efe6",
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.join(here, "preload.js")
    }
  });

  await window.loadURL("http://127.0.0.1:4310");
});

app.on("before-quit", () => {
  runtimeProcess?.kill();
});

app.on("window-all-closed", () => {
  app.quit();
});

async function waitForRuntime(): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 30000) {
    try {
      const response = await fetch("http://127.0.0.1:4310/api/health");
      if (response.ok) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for rebuild runtime to become ready.");
}
