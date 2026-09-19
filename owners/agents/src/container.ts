import type { HostContainerDescriptor } from "../../framework/src/contracts.js";

export function createAgentsContainer(): HostContainerDescriptor {
  return {
    containerId: "agents",
    ownerId: "agents",
    label: "Agents",
    summary: "Govern bounded digital operators with remit, continuity, memory, activation, and exportable packages.",
    kind: "workbench-heavy",
    defaultSurfaceId: "agents-workbench",
    environmentId: "agent-hall",
    surfaces: [
      {
        surfaceId: "agents-workbench",
        label: "Agent Workbench",
        category: "workbench",
        summary: "Inspect definitions, instances, activation state, and retained memory."
      },
      {
        surfaceId: "agents-permissions",
        label: "Permissions",
        category: "workbench",
        summary: "Manage capability grants, keycard visibility, and per-tool file permissions."
      },
      {
        surfaceId: "agents-workflows",
        label: "Workflows",
        category: "workbench",
        summary: "Author workflows, inspect triggers, preview targets, and submit executor-boundary run requests."
      },
      {
        surfaceId: "agents-environment",
        label: "Agent Environment",
        category: "workbench",
        summary: "Inspect hall and bay context, appearance posture, sections, and readiness."
      },
      {
        surfaceId: "agents-observability",
        label: "Agents Observability",
        category: "observability",
        summary: "Inspect counts, exported packages, and agent platform posture."
      }
    ]
  };
}
