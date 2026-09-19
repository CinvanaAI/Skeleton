declare module "electron" {
  export const app: {
    whenReady(): Promise<void>;
    on(event: string, handler: () => void): void;
    quit(): void;
    getPath(name: string): string;
  };

  export class BrowserWindow {
    constructor(input: {
      width: number;
      height: number;
      minWidth: number;
      minHeight: number;
      backgroundColor: string;
      webPreferences: {
        contextIsolation: boolean;
        sandbox: boolean;
        preload: string;
      };
    });
    loadURL(url: string): Promise<void>;
  }

  export const ipcMain: {
    handle(channel: string, listener: (...args: any[]) => unknown): void;
  };

  export const shell: {
    openPath(target: string): Promise<string>;
  };

  export const contextBridge: {
    exposeInMainWorld(name: string, api: unknown): void;
  };

  export const ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  };
}
