import type { HostContainerDescriptor } from "../../framework/src/contracts.js";

export function createStorageContainer(): HostContainerDescriptor {
  return {
    containerId: "storage",
    ownerId: "storage",
    label: "Storage",
    summary: "Inspect durable custody by owner namespace, record collections, and event streams without owning the meaning of stored truth.",
    kind: "admin-heavy",
    defaultSurfaceId: "storage-custody",
    surfaces: [
      {
        surfaceId: "storage-custody",
        label: "Custody Observability",
        category: "observability",
        summary: "Inspect owner namespaces, collection counts, retained events, and storage roots."
      }
    ]
  };
}
