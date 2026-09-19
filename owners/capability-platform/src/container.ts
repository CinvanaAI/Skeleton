import type { HostContainerDescriptor } from "../../framework/src/contracts.js";

export function createCapabilityPlatformContainer(): HostContainerDescriptor {
  return {
    containerId: "capability-platform",
    ownerId: "capability-platform",
    label: "Capability Platform",
    summary: "Govern capability packages as first-class objects with draft truth, publish, history, forms, and gates.",
    kind: "workbench-heavy",
    defaultSurfaceId: "capability-workbench",
    environmentId: "capability-platform",
    surfaces: [
      {
        surfaceId: "capability-workbench",
        label: "Package Workbench",
        category: "workbench",
        summary: "Author, inspect, validate, publish, and roll back capability packages."
      },
      {
        surfaceId: "capability-lifecycle-ledger",
        label: "Lifecycle Ledger",
        category: "observability",
        summary: "Inspect drafts, draft items, publication candidates, releases, rollback publications, and package events."
      },
      {
        surfaceId: "capability-policy-admin",
        label: "Policy Admin",
        category: "admin",
        summary: "Manage package surface policies, source registrations, gates, and published-form visibility."
      },
      {
        surfaceId: "capability-observability",
        label: "Platform Observability",
        category: "observability",
        summary: "Inspect gates, contracts, published forms, and platform-level package handling."
      }
    ]
  };
}
