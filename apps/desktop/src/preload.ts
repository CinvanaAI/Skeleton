import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("skeletonDesktop", {
  getPlatformRoots: () => ipcRenderer.invoke("framework:get-platform-roots"),
  openPath: (target: string) => ipcRenderer.invoke("framework:open-path", target)
});

export {};
