import type { HostContainerDescriptor } from "../../framework/src/contracts.js";

export function createExecutionEnvironmentContainer(): HostContainerDescriptor {
  return {
    containerId: "execution-environment",
    ownerId: "execution-environment",
    label: "Execution Environment",
    summary: "Govern true bounded operating places, lifecycle state, readiness, and environment projection.",
    kind: "admin-heavy",
    defaultSurfaceId: "environment-lifecycle",
    surfaces: [
      {
        surfaceId: "environment-lifecycle",
        label: "Environment Lifecycle",
        category: "observability",
        summary: "Inspect registered environments and manage their readiness or degraded posture."
      },
      {
        surfaceId: "bounded-executor",
        label: "Bounded Executor",
        category: "observability",
        summary: "Inspect bounded runtime runs, permission denials, outputs, failures, and execution evidence."
      }
    ]
  };
}
