import type { HostContainerDescriptor } from "./contracts.js";

export function createFrameworkDiagnosticsContainer(): HostContainerDescriptor {
  return {
    containerId: "framework",
    ownerId: "framework",
    label: "Framework",
    summary: "Host-level diagnostics, composition state, and mounted container inventory.",
    kind: "admin-heavy",
    defaultSurfaceId: "host-diagnostics",
    surfaces: [
      {
        surfaceId: "host-diagnostics",
        label: "Host Diagnostics",
        category: "observability",
        summary: "Inspect the host shell, mounted containers, environments, and coordination signals."
      }
    ]
  };
}
