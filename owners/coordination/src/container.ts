import type { HostContainerDescriptor } from "../../framework/src/contracts.js";

export function createCoordinationContainer(): HostContainerDescriptor {
  return {
    containerId: "coordination",
    ownerId: "coordination",
    label: "Coordination",
    summary: "Observe cross-owner handoffs, published signals, and routing posture without absorbing owner meaning.",
    kind: "mixed",
    defaultSurfaceId: "change-sessions",
    surfaces: [
      {
        surfaceId: "change-sessions",
        label: "Change Sessions",
        category: "workbench",
        summary: "Inspect governed change workflows, imported session truth, and execution evidence."
      },
      {
        surfaceId: "coordination-observability",
        label: "Handoff Observability",
        category: "observability",
        summary: "Inspect cross-owner events, routing counts, and recent handoff history."
      }
    ]
  };
}
