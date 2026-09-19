import type { HostContainerDescriptor } from "../../framework/src/contracts.js";

export function createIntegrationContainer(): HostContainerDescriptor {
  return {
    containerId: "integration",
    ownerId: "integration",
    label: "Integration",
    summary: "Govern external crossing, provider credentials, mode, and boundary visibility.",
    kind: "admin-heavy",
    defaultSurfaceId: "provider-control",
    surfaces: [
      {
        surfaceId: "provider-control",
        label: "Provider Control",
        category: "admin",
        summary: "Manage external provider credentials and runtime crossing mode."
      },
      {
        surfaceId: "integration-observability",
        label: "Crossing Observability",
        category: "observability",
        summary: "Inspect provider availability, mode, and integration posture."
      }
    ]
  };
}
