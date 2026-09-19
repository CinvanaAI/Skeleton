export type AgentInstanceState = "active" | "inactive";
export type AgentSectionKind =
  | "identity"
  | "tool-access"
  | "activation"
  | "current-state"
  | "persistent-state"
  | "recorded-memory"
  | "working-memory"
  | "notes"
  | "visibility-scope"
  | "workflow";
export type AgentAccessScope = "local" | "global";
export type AgentWorkflowRunStatus = "queued" | "blocked" | "running" | "complete" | "failed";

export interface AgentMemoryRegion {
  regionId: string;
  name: string;
  content: string;
}

export interface AgentDefinitionRecord {
  definitionId: string;
  label: string;
  remit: string;
  toolManifest: string[];
  triggers: string[];
  governanceFlags?: string[];
}

export interface AgentInstanceRecord {
  instanceId: string;
  definitionId: string;
  label: string;
  state: AgentInstanceState;
  createdAt: string;
  updatedAt: string;
  memory: AgentMemoryRegion[];
}

export interface AgentPackageRecord {
  packageId: string;
  instanceId: string;
  label: string;
  toolManifest: string[];
  memorySnapshot: AgentMemoryRegion[];
  exportedAt: string;
}

export interface AgentSpecRecord {
  specId: string;
  instanceId: string;
  definitionId: string;
  sectionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentSectionRecord {
  sectionId: string;
  instanceId: string;
  kind: AgentSectionKind;
  label: string;
  state: "draft" | "active" | "archived";
  body: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCapabilityAssignmentRecord {
  assignmentId: string;
  instanceId: string;
  packageId: string;
  surfaceIds: string[];
  scope: AgentAccessScope;
  status: "granted" | "revoked" | "unavailable";
  grantedAt: string;
  revokedAt?: string;
  reason?: string;
}

export interface AgentFileAssignmentRecord {
  assignmentId: string;
  instanceId: string;
  path: string;
  kind: "file" | "folder";
  root: string;
  relativePath: string;
  visibility: "visible" | "hidden";
  globalToolEligible: boolean;
  assignedAt: string;
}

export interface AgentToolFilePermissionRecord {
  permissionId: string;
  instanceId: string;
  toolId: string;
  path: string;
  scope: AgentAccessScope;
  access: "read" | "write" | "execute" | "deny";
  source: "direct" | "global-sync";
  grantedAt: string;
}

export interface AgentWorkflowTriggerRecord {
  triggerId: string;
  kind: "manual" | "schedule" | "event" | "file-change";
  label: string;
  enabled: boolean;
}

export interface AgentWorkflowRecord {
  workflowId: string;
  instanceId: string;
  label: string;
  instruction: string;
  toolIds?: string[];
  packageIds?: string[];
  triggerIds: string[];
  triggers: AgentWorkflowTriggerRecord[];
  manualOrder: number;
  targetPolicy: {
    root?: string;
    include: string[];
    exclude: string[];
  };
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentWorkflowTargetPreview {
  workflowId: string;
  instanceId: string;
  targets: Array<{
    path: string;
    kind: "file" | "folder";
    permitted: boolean;
    reason: string;
  }>;
  warnings: string[];
}

export interface AgentWorkflowRunRecord {
  runId: string;
  workflowId: string;
  instanceId: string;
  status: AgentWorkflowRunStatus;
  requestedAt: string;
  updatedAt: string;
  executorRunId?: string;
  executorBoundaryRequired: boolean;
  summary: string;
  targetPreview: AgentWorkflowTargetPreview;
  permissionChecks: Array<{
    checkId: string;
    ok: boolean;
    summary: string;
    details?: Record<string, unknown>;
  }>;
  permissionDenials: string[];
  outputs: Array<{
    outputId: string;
    label: string;
    mediaType: string;
    body: string;
    createdAt: string;
  }>;
  failures: Array<{
    at: string;
    summary: string;
    details?: Record<string, unknown>;
  }>;
  events: Array<{
    at: string;
    type: string;
    summary: string;
  }>;
}

export interface AgentEnvironmentAssetRecord {
  assetId: string;
  ownerId: string;
  instanceId?: string;
  label: string;
  kind: "background" | "avatar" | "skin";
  storageRef?: string;
  createdAt: string;
}

export interface AgentAppearancePreferenceRecord {
  preferenceId: string;
  instanceId: string;
  selectedAssetId?: string;
  density: "compact" | "comfortable";
  accent: string;
  updatedAt: string;
}

export interface AgentEnvironmentContext {
  environmentId: string;
  instanceId: string;
  hallReady: boolean;
  bayReady: boolean;
  sections: AgentSectionRecord[];
  capabilityAssignments: AgentCapabilityAssignmentRecord[];
  fileAssignments: AgentFileAssignmentRecord[];
  toolFilePermissions: AgentToolFilePermissionRecord[];
  workflows: AgentWorkflowRecord[];
  appearance?: AgentAppearancePreferenceRecord;
}

export interface AgentsObservability {
  storageRoot: string;
  definitionCount: number;
  instanceCount: number;
  packageCount: number;
  activeCount: number;
  inactiveCount: number;
  importedLegacyCount: number;
  specCount: number;
  sectionCount: number;
  capabilityAssignmentCount: number;
  fileAssignmentCount: number;
  toolFilePermissionCount: number;
  workflowCount: number;
  workflowRunCount: number;
  environmentAssetCount: number;
  appearancePreferenceCount: number;
}

export interface LegacyAgentsImportReport {
  rootsUsed: string[];
  importedDefinitions: string[];
  importedInstances: string[];
  importedMemoryOwners: string[];
}
