import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CoordinationLayerService } from "../../coordination/src/service.js";
import type { BoundedExecutorService } from "../../execution-environment/src/executor.js";
import type {
  BoundedExecutorPermissionDecision,
  BoundedExecutorRunRecord
} from "../../execution-environment/src/records.js";
import type { StorageSubstrateService } from "../../storage/src/service.js";
import type {
  AgentAccessScope,
  AgentAppearancePreferenceRecord,
  AgentCapabilityAssignmentRecord,
  AgentDefinitionRecord,
  AgentEnvironmentAssetRecord,
  AgentEnvironmentContext,
  AgentFileAssignmentRecord,
  AgentInstanceRecord,
  AgentInstanceState,
  AgentMemoryRegion,
  AgentPackageRecord,
  AgentSectionKind,
  AgentSectionRecord,
  AgentSpecRecord,
  AgentToolFilePermissionRecord,
  AgentWorkflowRecord,
  AgentWorkflowRunRecord,
  AgentWorkflowTargetPreview,
  AgentsObservability,
  LegacyAgentsImportReport
} from "./records.js";

const OWNER_ID = "agents";
const DEFINITIONS = "definitions";
const INSTANCES = "instances";
const PACKAGES = "packages";
const SPECS = "specs";
const SECTIONS = "sections";
const CAPABILITY_ASSIGNMENTS = "capability-assignments";
const FILE_ASSIGNMENTS = "file-assignments";
const TOOL_FILE_PERMISSIONS = "tool-file-permissions";
const WORKFLOWS = "workflows";
const WORKFLOW_RUNS = "workflow-runs";
const ENVIRONMENT_ASSETS = "environment-assets";
const APPEARANCE_PREFERENCES = "appearance-preferences";
const MIGRATION_ID = "agents.bounded-operator.v1";

interface LegacyAgentDefinition {
  definitionId: string;
  label: string;
  remit: string;
  toolIds?: string[];
  triggers?: Array<{ label?: string; kind?: string }>;
  governanceFlags?: string[];
}

interface LegacyAgentInstance {
  instanceId: string;
  definitionId: string;
  label: string;
  state: AgentInstanceState;
  createdAt?: string;
  updatedAt?: string;
}

interface LegacyMemoryRecord {
  ownerType?: string;
  ownerId?: string;
  regionId: string;
  memoryName?: string;
  title?: string;
  content: string;
}

interface PackageAccessAuthorization {
  ok: boolean;
  checkedAt: string;
  summary: string;
  checks: Array<{
    checkId: string;
    ok: boolean;
    summary: string;
    details?: Record<string, unknown>;
  }>;
  denials: string[];
}

type PackageAccessAuthorizer = (input: {
  packageId: string;
  requestedByOwnerId: string;
  requestedByRecordId: string;
  surfaceId: "published";
  grantEvidence: {
    ownerId: "agents";
    grantId: string;
    surfaceIds: string[];
    scope?: AgentAccessScope;
  };
}) => Promise<PackageAccessAuthorization>;

export class AgentsDomainService {
  constructor(
    private readonly storage: StorageSubstrateService,
    private readonly coordination: CoordinationLayerService
  ) {}

  async initialize(): Promise<void> {
    let definitions = await this.storage.listRecords<AgentDefinitionRecord>(OWNER_ID, DEFINITIONS);
    if (definitions.length === 0) {
      await Promise.all(
        DEFAULT_DEFINITIONS.map((definition) =>
          this.storage.putRecord(OWNER_ID, DEFINITIONS, definition.definitionId, definition)
        )
      );
      definitions = await this.storage.listRecords<AgentDefinitionRecord>(OWNER_ID, DEFINITIONS);
    }
    let instances = await this.storage.listRecords<AgentInstanceRecord>(OWNER_ID, INSTANCES);
    if (instances.length === 0) {
      const now = new Date().toISOString();
      await this.storage.putRecord(OWNER_ID, INSTANCES, "agt.sherlock.1", {
        instanceId: "agt.sherlock.1",
        definitionId: "agent.sherlock",
        label: "Sherlock",
        state: "inactive",
        createdAt: now,
        updatedAt: now,
        memory: [
          {
            regionId: "identity",
            name: "Identity",
            content: "Sherlock is a boundary-guard agent focused on ownership drift and structural violations."
          },
          {
            regionId: "stance",
            name: "Stance",
            content: "Prefer structural truth over convenience, and surface leaks in ownership or runtime authority."
          }
        ]
      });
      instances = await this.storage.listRecords<AgentInstanceRecord>(OWNER_ID, INSTANCES);
    }
    for (const instance of instances) {
      const definition = definitions.find((candidate) => candidate.definitionId === instance.definitionId);
      if (definition) {
        await this.ensureAgentInternals(instance, definition);
      }
    }
    const migrations = await this.storage.listMigrations(OWNER_ID);
    if (!migrations.some((migration) => migration.migrationId === MIGRATION_ID)) {
      await this.storage.recordMigration({
        ownerId: OWNER_ID,
        migrationId: MIGRATION_ID,
        label: "Agents bounded operator records",
        status: "applied",
        summary: "Established agent specs, sections, grants, keycards, file permissions, workflows, and appearance preferences."
      });
    }
  }

  listDefinitions(): Promise<AgentDefinitionRecord[]> {
    return this.storage.listRecords(OWNER_ID, DEFINITIONS);
  }

  listInstances(): Promise<AgentInstanceRecord[]> {
    return this.storage.listRecords(OWNER_ID, INSTANCES);
  }

  async getInstance(instanceId: string): Promise<AgentInstanceRecord | undefined> {
    return this.storage.getRecord(OWNER_ID, INSTANCES, instanceId);
  }

  async getSpec(instanceId: string): Promise<AgentSpecRecord> {
    const instance = await this.requireInstance(instanceId);
    const definition = await this.requireDefinition(instance.definitionId);
    return this.ensureAgentInternals(instance, definition);
  }

  async listSections(instanceId: string): Promise<AgentSectionRecord[]> {
    await this.getSpec(instanceId);
    const sections = await this.storage.listRecords<AgentSectionRecord>(OWNER_ID, SECTIONS);
    return sections
      .filter((section) => section.instanceId === instanceId)
      .sort((left, right) => left.kind.localeCompare(right.kind));
  }

  async updateSection(
    instanceId: string,
    kind: AgentSectionKind,
    body: Record<string, unknown>
  ): Promise<AgentSectionRecord> {
    await this.getSpec(instanceId);
    const sections = await this.listSections(instanceId);
    const section = sections.find((candidate) => candidate.kind === kind);
    if (!section) {
      throw new Error(`Section ${kind} was not found for ${instanceId}.`);
    }
    const next: AgentSectionRecord = {
      ...section,
      state: "active",
      body,
      updatedAt: new Date().toISOString()
    };
    await this.storage.putRecord(OWNER_ID, SECTIONS, section.sectionId, next);
    await this.coordination.recordEvent({
      ownerId: OWNER_ID,
      type: "agent-section-updated",
      summary: `Updated ${kind} section for ${instanceId}.`,
      details: {
        instanceId,
        kind
      }
    });
    return next;
  }

  async listCapabilityAssignments(instanceId: string): Promise<AgentCapabilityAssignmentRecord[]> {
    await this.getSpec(instanceId);
    const assignments = await this.storage.listRecords<AgentCapabilityAssignmentRecord>(
      OWNER_ID,
      CAPABILITY_ASSIGNMENTS
    );
    return assignments
      .filter((assignment) => assignment.instanceId === instanceId)
      .sort((left, right) => left.packageId.localeCompare(right.packageId));
  }

  async grantCapability(input: {
    instanceId: string;
    packageId: string;
    surfaceIds?: string[];
    scope?: AgentAccessScope;
    reason?: string;
  }): Promise<AgentCapabilityAssignmentRecord> {
    await this.getSpec(input.instanceId);
    const assignmentId = `grant:${input.instanceId}:${input.packageId}:${input.scope ?? "local"}`;
    const assignment: AgentCapabilityAssignmentRecord = {
      assignmentId,
      instanceId: input.instanceId,
      packageId: input.packageId,
      surfaceIds: input.surfaceIds?.length ? input.surfaceIds : ["published"],
      scope: input.scope ?? "local",
      status: "granted",
      grantedAt: new Date().toISOString(),
      ...(input.reason ? { reason: input.reason } : {})
    };
    await this.storage.putRecord(OWNER_ID, CAPABILITY_ASSIGNMENTS, assignmentId, assignment);
    await this.refreshToolAccessSection(input.instanceId);
    await this.coordination.recordEvent({
      ownerId: OWNER_ID,
      type: "agent-capability-granted",
      summary: `Granted ${input.packageId} to ${input.instanceId}.`,
      details: {
        assignment
      }
    });
    return assignment;
  }

  async revokeCapability(
    instanceId: string,
    assignmentId: string,
    reason?: string
  ): Promise<AgentCapabilityAssignmentRecord> {
    const assignment = await this.storage.getRecord<AgentCapabilityAssignmentRecord>(
      OWNER_ID,
      CAPABILITY_ASSIGNMENTS,
      assignmentId
    );
    if (!assignment || assignment.instanceId !== instanceId) {
      throw new Error(`Capability assignment ${assignmentId} was not found for ${instanceId}.`);
    }
    const next: AgentCapabilityAssignmentRecord = {
      ...assignment,
      status: "revoked",
      revokedAt: new Date().toISOString(),
      ...(reason ? { reason } : {})
    };
    await this.storage.putRecord(OWNER_ID, CAPABILITY_ASSIGNMENTS, assignmentId, next);
    await this.refreshToolAccessSection(instanceId);
    return next;
  }

  async listFileAssignments(instanceId: string): Promise<AgentFileAssignmentRecord[]> {
    await this.getSpec(instanceId);
    const assignments = await this.storage.listRecords<AgentFileAssignmentRecord>(OWNER_ID, FILE_ASSIGNMENTS);
    return assignments
      .filter((assignment) => assignment.instanceId === instanceId)
      .sort((left, right) => left.path.localeCompare(right.path));
  }

  async assignFile(input: {
    instanceId: string;
    path: string;
    kind?: "file" | "folder";
    root?: string;
    relativePath?: string;
    globalToolEligible?: boolean;
  }): Promise<AgentFileAssignmentRecord> {
    await this.getSpec(input.instanceId);
    const normalizedPath = normalizePathKey(input.path);
    const assignment: AgentFileAssignmentRecord = {
      assignmentId: `file:${input.instanceId}:${normalizedPath}`,
      instanceId: input.instanceId,
      path: input.path,
      kind: input.kind ?? "file",
      root: input.root ?? "",
      relativePath: input.relativePath ?? input.path,
      visibility: "visible",
      globalToolEligible: Boolean(input.globalToolEligible),
      assignedAt: new Date().toISOString()
    };
    await this.storage.putRecord(OWNER_ID, FILE_ASSIGNMENTS, assignment.assignmentId, assignment);
    await this.refreshVisibilitySection(input.instanceId);
    return assignment;
  }

  async listToolFilePermissions(instanceId: string): Promise<AgentToolFilePermissionRecord[]> {
    await this.getSpec(instanceId);
    const permissions = await this.storage.listRecords<AgentToolFilePermissionRecord>(
      OWNER_ID,
      TOOL_FILE_PERMISSIONS
    );
    return permissions
      .filter((permission) => permission.instanceId === instanceId)
      .sort((left, right) => left.toolId.localeCompare(right.toolId) || left.path.localeCompare(right.path));
  }

  async setToolFilePermission(input: {
    instanceId: string;
    toolId: string;
    path: string;
    access: AgentToolFilePermissionRecord["access"];
    scope?: AgentAccessScope;
    source?: AgentToolFilePermissionRecord["source"];
  }): Promise<AgentToolFilePermissionRecord> {
    await this.getSpec(input.instanceId);
    const permission: AgentToolFilePermissionRecord = {
      permissionId: `permission:${input.instanceId}:${input.toolId}:${normalizePathKey(input.path)}`,
      instanceId: input.instanceId,
      toolId: input.toolId,
      path: input.path,
      scope: input.scope ?? "local",
      access: input.access,
      source: input.source ?? "direct",
      grantedAt: new Date().toISOString()
    };
    await this.storage.putRecord(OWNER_ID, TOOL_FILE_PERMISSIONS, permission.permissionId, permission);
    await this.refreshToolAccessSection(input.instanceId);
    return permission;
  }

  async listWorkflows(instanceId: string): Promise<AgentWorkflowRecord[]> {
    await this.getSpec(instanceId);
    const workflows = await this.storage.listRecords<AgentWorkflowRecord>(OWNER_ID, WORKFLOWS);
    return workflows
      .filter((workflow) => workflow.instanceId === instanceId)
      .sort((left, right) => left.manualOrder - right.manualOrder || left.label.localeCompare(right.label));
  }

  async upsertWorkflow(
    instanceId: string,
    input: Partial<AgentWorkflowRecord> & Pick<AgentWorkflowRecord, "label" | "instruction">
  ): Promise<AgentWorkflowRecord> {
    await this.getSpec(instanceId);
    const now = new Date().toISOString();
    const workflowId = input.workflowId ?? randomUUID();
    const existing = await this.storage.getRecord<AgentWorkflowRecord>(OWNER_ID, WORKFLOWS, workflowId);
    const workflow: AgentWorkflowRecord = {
      workflowId,
      instanceId,
      label: input.label.trim(),
      instruction: input.instruction,
      toolIds: input.toolIds ?? existing?.toolIds ?? [],
      packageIds: input.packageIds ?? existing?.packageIds ?? [],
      triggerIds: input.triggers?.map((trigger) => trigger.triggerId) ?? input.triggerIds ?? ["manual"],
      triggers: input.triggers ?? [
        {
          triggerId: "manual",
          kind: "manual",
          label: "Manual",
          enabled: true
        }
      ],
      manualOrder: input.manualOrder ?? existing?.manualOrder ?? 100,
      targetPolicy: input.targetPolicy ?? existing?.targetPolicy ?? { include: [], exclude: [] },
      enabled: input.enabled ?? existing?.enabled ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    await this.storage.putRecord(OWNER_ID, WORKFLOWS, workflow.workflowId, workflow);
    await this.refreshWorkflowSection(instanceId);
    return workflow;
  }

  async previewWorkflowTargets(
    instanceId: string,
    workflowId: string
  ): Promise<AgentWorkflowTargetPreview> {
    const workflow = await this.requireWorkflow(instanceId, workflowId);
    const instance = await this.requireInstance(instanceId);
    const definition = await this.requireDefinition(instance.definitionId);
    const files = await this.listFileAssignments(instanceId);
    const permissions = await this.listToolFilePermissions(instanceId);
    const toolIds = workflow.toolIds?.length ? workflow.toolIds : definition.toolManifest;
    const includeMatchers = workflow.targetPolicy.include;
    const excludeMatchers = workflow.targetPolicy.exclude;
    const visible = files.filter((file) => file.visibility === "visible");
    const targets = visible
      .filter((file) => matchesAny(file.path, includeMatchers) || includeMatchers.length === 0)
      .filter((file) => !matchesAny(file.path, excludeMatchers))
      .map((file) => {
        const denials = permissions.filter(
          (candidate) =>
            toolIds.includes(candidate.toolId) &&
            pathCovers(candidate.path, file.path) &&
            candidate.access === "deny"
        );
        const missingTools = file.globalToolEligible
          ? []
          : toolIds.filter(
              (toolId) =>
                !permissions.some(
                  (candidate) =>
                    candidate.toolId === toolId &&
                    pathCovers(candidate.path, file.path) &&
                    candidate.access !== "deny"
                )
            );
        const permitted = denials.length === 0 && missingTools.length === 0;
        return {
          path: file.path,
          kind: file.kind,
          permitted,
          reason: permitted
            ? file.globalToolEligible
              ? "File is visible and globally eligible for workflow tool use."
              : "File is visible and all workflow tools have direct permission."
            : denials.length > 0
              ? `Explicit deny blocks ${denials.map((denial) => denial.toolId).join(", ")}.`
              : `Missing per-tool permission for ${missingTools.join(", ")}.`
        };
      });
    return {
      workflowId,
      instanceId,
      targets,
      warnings: targets.some((target) => !target.permitted)
        ? ["One or more visible targets lack per-tool permission."]
        : []
    };
  }

  async requestWorkflowRun(
    instanceId: string,
    workflowId: string,
    executor: BoundedExecutorService,
    packageAuthorizer?: PackageAccessAuthorizer
  ): Promise<AgentWorkflowRunRecord> {
    const instance = await this.requireInstance(instanceId);
    const definition = await this.requireDefinition(instance.definitionId);
    const workflow = await this.requireWorkflow(instanceId, workflowId);
    const preview = await this.previewWorkflowTargets(instanceId, workflowId);
    const now = new Date().toISOString();
    const checks: AgentWorkflowRunRecord["permissionChecks"] = [];
    const denials: string[] = [];
    const toolIds = workflow.toolIds?.length ? workflow.toolIds : definition.toolManifest;
    const packageIds = workflow.packageIds ?? [];

    const addCheck = (checkId: string, ok: boolean, summary: string, details?: Record<string, unknown>) => {
      checks.push({
        checkId,
        ok,
        summary,
        ...(details ? { details } : {})
      });
      if (!ok) {
        denials.push(summary);
      }
    };

    addCheck(
      "agent-active",
      instance.state === "active",
      instance.state === "active" ? "Agent activation gate is open." : "Agent is inactive."
    );
    addCheck(
      "workflow-enabled",
      workflow.enabled,
      workflow.enabled ? "Workflow is enabled." : "Workflow is disabled."
    );
    const unknownTools = toolIds.filter((toolId) => !definition.toolManifest.includes(toolId));
    addCheck(
      "workflow-tools-declared",
      unknownTools.length === 0,
      unknownTools.length === 0
        ? "Workflow tools are declared on the agent definition."
        : `Workflow references undeclared tools: ${unknownTools.join(", ")}.`,
      {
        toolIds,
        manifest: definition.toolManifest
      }
    );
    const deniedTargets = preview.targets.filter((target) => !target.permitted);
    addCheck(
      "target-permissions",
      deniedTargets.length === 0,
      deniedTargets.length === 0
        ? "All visible workflow targets satisfy keycard and per-tool file permissions."
        : `${deniedTargets.length} workflow target(s) failed runtime file permission checks.`,
      {
        deniedTargets
      }
    );
    if (workflow.targetPolicy.include.length > 0) {
      addCheck(
        "target-policy-matched-visible-keycard",
        preview.targets.length > 0,
        preview.targets.length > 0
          ? "Workflow target policy matched visible keycard targets."
          : "Workflow target policy did not match any visible keycard targets."
      );
    }

    const assignments = await this.listCapabilityAssignments(instanceId);
    for (const packageId of packageIds) {
      const assignment = assignments.find(
        (candidate) =>
          candidate.packageId === packageId &&
          candidate.status === "granted" &&
          (candidate.surfaceIds.includes("published") || candidate.surfaceIds.includes("*"))
      );
      addCheck(
        `capability-grant:${packageId}`,
        Boolean(assignment),
        assignment
          ? `Agent has a published-surface grant for ${packageId}.`
          : `Agent lacks a published-surface grant for ${packageId}.`
      );
      if (!assignment) {
        continue;
      }
      if (!packageAuthorizer) {
        addCheck(
          `package-policy:${packageId}`,
          false,
          `Package policy authorization is unavailable for ${packageId}.`
        );
        continue;
      }
      const packageAuthorization = await packageAuthorizer({
        packageId,
        requestedByOwnerId: OWNER_ID,
        requestedByRecordId: instanceId,
        surfaceId: "published",
        grantEvidence: {
          ownerId: "agents",
          grantId: assignment.assignmentId,
          surfaceIds: assignment.surfaceIds,
          scope: assignment.scope
        }
      });
      addCheck(
        `package-policy:${packageId}`,
        packageAuthorization.ok,
        packageAuthorization.summary,
        {
          packageChecks: packageAuthorization.checks,
          packageDenials: packageAuthorization.denials
        }
      );
    }

    const permissionDecision: BoundedExecutorPermissionDecision = {
      ok: denials.length === 0,
      checkedAt: new Date().toISOString(),
      summary:
        denials.length === 0
          ? "Agent workflow runtime permissions passed."
          : "Agent workflow runtime permissions failed.",
      checks,
      denials
    };
    const executorRun: BoundedExecutorRunRecord = await executor.submit({
      actionKind: "agent.workflow",
      actionId: workflowId,
      requestedByOwnerId: OWNER_ID,
      requestedByRecordId: instanceId,
      environmentId: "agent-hall",
      ownerRefs: [`agents:instance:${instanceId}`, `agents:workflow:${workflowId}`],
      permissionDecision,
      input: {
        instanceId,
        workflowId,
        workflowLabel: workflow.label,
        instruction: workflow.instruction,
        toolIds,
        packages: packageIds,
        targets: preview.targets.filter((target) => target.permitted)
      }
    });
    const run: AgentWorkflowRunRecord = {
      runId: randomUUID(),
      workflowId,
      instanceId,
      status: executorRun.status === "denied" ? "blocked" : executorRun.status,
      requestedAt: executorRun.requestedAt,
      updatedAt: executorRun.updatedAt,
      executorRunId: executorRun.runId,
      executorBoundaryRequired: true,
      summary:
        executorRun.status === "complete"
          ? "Workflow executed through the bounded executor."
          : executorRun.status === "denied"
            ? "Workflow execution was blocked by runtime permission checks."
            : executorRun.status === "failed"
              ? "Workflow execution failed inside the bounded executor."
              : "Workflow execution is in progress.",
      targetPreview: preview,
      permissionChecks: checks,
      permissionDenials: executorRun.permissionDenials,
      outputs: executorRun.outputs,
      failures: executorRun.failures,
      events: executorRun.events.map((event) => ({
        at: event.at,
        type: event.type,
        summary: event.summary
      })).concat([
        {
          at: new Date().toISOString(),
          type: executorRun.status === "denied" ? "permission-denial-recorded" : "runtime-evidence-recorded",
          summary:
            executorRun.status === "denied"
              ? "Runtime permission denial evidence was recorded."
              : "Runtime execution evidence was recorded."
        }
      ])
    };
    await this.storage.putRecord(OWNER_ID, WORKFLOW_RUNS, run.runId, run);
    await this.coordination.recordEvent({
      ownerId: OWNER_ID,
      type: executorRun.status === "denied" ? "agent-workflow-run-denied" : `agent-workflow-run-${executorRun.status}`,
      summary:
        executorRun.status === "denied"
          ? `Denied workflow execution for ${instanceId}.`
          : `Recorded ${executorRun.status} workflow execution for ${instanceId}.`,
      details: {
        instanceId,
        workflowId,
        runId: run.runId,
        executorRunId: executorRun.runId,
        permissionDenials: run.permissionDenials,
        outputCount: run.outputs.length,
        failureCount: run.failures.length
      }
    });
    return run;
  }

  async listWorkflowRuns(instanceId: string): Promise<AgentWorkflowRunRecord[]> {
    await this.getSpec(instanceId);
    const runs = await this.storage.listRecords<AgentWorkflowRunRecord>(OWNER_ID, WORKFLOW_RUNS);
    return runs
      .filter((run) => run.instanceId === instanceId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async getEnvironmentContext(instanceId: string): Promise<AgentEnvironmentContext> {
    const [sections, capabilityAssignments, fileAssignments, toolFilePermissions, workflows] =
      await Promise.all([
        this.listSections(instanceId),
        this.listCapabilityAssignments(instanceId),
        this.listFileAssignments(instanceId),
        this.listToolFilePermissions(instanceId),
        this.listWorkflows(instanceId)
      ]);
    const appearance = await this.storage.getRecord<AgentAppearancePreferenceRecord>(
      OWNER_ID,
      APPEARANCE_PREFERENCES,
      `appearance:${instanceId}`
    );
    return {
      environmentId: `agent-bay:${instanceId}`,
      instanceId,
      hallReady: true,
      bayReady: true,
      sections,
      capabilityAssignments,
      fileAssignments,
      toolFilePermissions,
      workflows,
      ...(appearance ? { appearance } : {})
    };
  }

  async setInstanceState(
    instanceId: string,
    state: AgentInstanceState
  ): Promise<AgentInstanceRecord> {
    const instance = await this.requireInstance(instanceId);
    const next: AgentInstanceRecord = {
      ...instance,
      state,
      updatedAt: new Date().toISOString()
    };
    await this.storage.putRecord(OWNER_ID, INSTANCES, instanceId, next);
    const sections = await this.listSections(instanceId);
    const activation = sections.find((section) => section.kind === "activation");
    if (activation) {
      await this.storage.putRecord(OWNER_ID, SECTIONS, activation.sectionId, {
        ...activation,
        body: {
          state,
          active: state === "active",
          singleGate: "Agent activation is enforced by the instance state record."
        },
        updatedAt: next.updatedAt
      } satisfies AgentSectionRecord);
    }
    await this.coordination.recordEvent({
      ownerId: OWNER_ID,
      type: "activation-changed",
      summary: `${instance.label} is now ${state}.`,
      details: {
        instanceId,
        state
      }
    });
    return next;
  }

  async exportInstance(instanceId: string): Promise<AgentPackageRecord> {
    const instance = await this.requireInstance(instanceId);
    const definition = await this.requireDefinition(instance.definitionId);
    const pkg: AgentPackageRecord = {
      packageId: randomUUID(),
      instanceId,
      label: instance.label,
      toolManifest: definition.toolManifest,
      memorySnapshot: instance.memory,
      exportedAt: new Date().toISOString()
    };
    await this.storage.putRecord(OWNER_ID, PACKAGES, pkg.packageId, pkg);
    await this.coordination.recordEvent({
      ownerId: OWNER_ID,
      type: "package-exported",
      summary: `Exported ${instance.label} as an agent package.`,
      details: {
        instanceId,
        packageId: pkg.packageId
      }
    });
    return pkg;
  }

  listPackages(): Promise<AgentPackageRecord[]> {
    return this.storage.listRecords(OWNER_ID, PACKAGES);
  }

  async inspectObservability(): Promise<AgentsObservability> {
    const [
      definitions,
      instances,
      packages,
      specs,
      sections,
      capabilityAssignments,
      fileAssignments,
      toolFilePermissions,
      workflows,
      workflowRuns,
      environmentAssets,
      appearancePreferences
    ] = await Promise.all([
      this.listDefinitions(),
      this.listInstances(),
      this.listPackages(),
      this.storage.listRecords<AgentSpecRecord>(OWNER_ID, SPECS),
      this.storage.listRecords<AgentSectionRecord>(OWNER_ID, SECTIONS),
      this.storage.listRecords<AgentCapabilityAssignmentRecord>(OWNER_ID, CAPABILITY_ASSIGNMENTS),
      this.storage.listRecords<AgentFileAssignmentRecord>(OWNER_ID, FILE_ASSIGNMENTS),
      this.storage.listRecords<AgentToolFilePermissionRecord>(OWNER_ID, TOOL_FILE_PERMISSIONS),
      this.storage.listRecords<AgentWorkflowRecord>(OWNER_ID, WORKFLOWS),
      this.storage.listRecords<AgentWorkflowRunRecord>(OWNER_ID, WORKFLOW_RUNS),
      this.storage.listRecords<AgentEnvironmentAssetRecord>(OWNER_ID, ENVIRONMENT_ASSETS),
      this.storage.listRecords<AgentAppearancePreferenceRecord>(OWNER_ID, APPEARANCE_PREFERENCES)
    ]);
    return {
      storageRoot: this.storage.namespacePath(OWNER_ID),
      definitionCount: definitions.length,
      instanceCount: instances.length,
      packageCount: packages.length,
      activeCount: instances.filter((instance) => instance.state === "active").length,
      inactiveCount: instances.filter((instance) => instance.state === "inactive").length,
      importedLegacyCount: definitions.filter((definition) =>
        Boolean(definition.governanceFlags?.includes("legacy-import"))
      ).length,
      specCount: specs.length,
      sectionCount: sections.length,
      capabilityAssignmentCount: capabilityAssignments.length,
      fileAssignmentCount: fileAssignments.length,
      toolFilePermissionCount: toolFilePermissions.length,
      workflowCount: workflows.length,
      workflowRunCount: workflowRuns.length,
      environmentAssetCount: environmentAssets.length,
      appearancePreferenceCount: appearancePreferences.length
    };
  }

  async importLegacyAgents(roots: string[]): Promise<LegacyAgentsImportReport> {
    const importedDefinitions = new Set<string>();
    const importedInstances = new Set<string>();
    const importedMemoryOwners = new Set<string>();
    const memoryByOwner = new Map<string, AgentMemoryRegion[]>();

    for (const root of roots.filter(Boolean)) {
      const definitionPaths = [
        path.join(root, "agent-definitions"),
        path.join(root, "agent-truth", "definitions")
      ];
      for (const definitionPath of definitionPaths) {
        const files = await readdir(definitionPath, { withFileTypes: true }).catch(() => []);
        for (const file of files) {
          if (!file.isFile() || !file.name.endsWith(".json")) {
            continue;
          }
          const legacy = await readJsonFile<LegacyAgentDefinition>(path.join(definitionPath, file.name));
          if (!legacy?.definitionId) {
            continue;
          }
          const definition: AgentDefinitionRecord = {
            definitionId: normalizeId(legacy.definitionId),
            label: legacy.label?.trim() || legacy.definitionId,
            remit: legacy.remit?.trim() || "Imported legacy agent.",
            toolManifest: (legacy.toolIds ?? []).map((toolId) => toolId.trim()).filter(Boolean),
            triggers: (legacy.triggers ?? [])
              .map((trigger) => trigger.kind?.trim() || trigger.label?.trim() || "")
              .filter(Boolean),
            governanceFlags: [...(legacy.governanceFlags ?? []), "legacy-import"]
          };
          await this.storage.putRecord(OWNER_ID, DEFINITIONS, definition.definitionId, definition);
          importedDefinitions.add(definition.definitionId);
        }
      }

      const memoryPaths = [path.join(root, "memory")];
      for (const memoryPath of memoryPaths) {
        const files = await readdir(memoryPath, { withFileTypes: true }).catch(() => []);
        for (const file of files) {
          if (!file.isFile() || !file.name.endsWith(".json")) {
            continue;
          }
          const legacy = await readJsonFile<LegacyMemoryRecord>(path.join(memoryPath, file.name));
          if (!legacy?.regionId || legacy.ownerType !== "agent" || !legacy.ownerId) {
            continue;
          }
          const normalizedOwnerId = normalizeId(legacy.ownerId);
          const regions = memoryByOwner.get(normalizedOwnerId) ?? [];
          regions.push({
            regionId: legacy.regionId,
            name: legacy.memoryName ?? legacy.title ?? legacy.regionId,
            content: legacy.content
          });
          memoryByOwner.set(normalizedOwnerId, regions);
        }
      }

      const instancePaths = [
        path.join(root, "agent-instances"),
        path.join(root, "agent-truth", "instances")
      ];
      for (const instancePath of instancePaths) {
        const files = await readdir(instancePath, { withFileTypes: true }).catch(() => []);
        for (const file of files) {
          if (!file.isFile() || !file.name.endsWith(".json")) {
            continue;
          }
          const legacy = await readJsonFile<LegacyAgentInstance>(path.join(instancePath, file.name));
          if (!legacy?.instanceId || !legacy.definitionId) {
            continue;
          }
          const instanceId = normalizeId(legacy.instanceId);
          const instance: AgentInstanceRecord = {
            instanceId,
            definitionId: normalizeId(legacy.definitionId),
            label: legacy.label?.trim() || legacy.instanceId,
            state: legacy.state === "active" ? "active" : "inactive",
            createdAt: legacy.createdAt ?? new Date().toISOString(),
            updatedAt: legacy.updatedAt ?? legacy.createdAt ?? new Date().toISOString(),
            memory: dedupeMemory(memoryByOwner.get(instanceId) ?? [])
          };
          await this.storage.putRecord(OWNER_ID, INSTANCES, instance.instanceId, instance);
          importedInstances.add(instance.instanceId);
          if (instance.memory.length > 0) {
            importedMemoryOwners.add(instance.instanceId);
          }
        }
      }
    }

    if (importedDefinitions.size > 0 || importedInstances.size > 0) {
      const definitions = await this.listDefinitions();
      const instances = await this.listInstances();
      for (const instance of instances.filter((candidate) => importedInstances.has(candidate.instanceId))) {
        const definition = definitions.find((candidate) => candidate.definitionId === instance.definitionId);
        if (definition) {
          await this.ensureAgentInternals(instance, definition);
        }
      }
      await this.coordination.recordEvent({
        ownerId: OWNER_ID,
        type: "legacy-agents-imported",
        summary: `Imported ${importedDefinitions.size} agent definition(s) and ${importedInstances.size} instance(s).`,
        details: {
          rootsUsed: roots.filter(Boolean),
          importedDefinitions: Array.from(importedDefinitions),
          importedInstances: Array.from(importedInstances)
        }
      });
    }

    return {
      rootsUsed: roots.filter(Boolean),
      importedDefinitions: Array.from(importedDefinitions).sort(),
      importedInstances: Array.from(importedInstances).sort(),
      importedMemoryOwners: Array.from(importedMemoryOwners).sort()
    };
  }

  private async ensureAgentInternals(
    instance: AgentInstanceRecord,
    definition: AgentDefinitionRecord
  ): Promise<AgentSpecRecord> {
    const now = new Date().toISOString();
    const specId = `spec:${instance.instanceId}`;
    const existing = await this.storage.getRecord<AgentSpecRecord>(OWNER_ID, SPECS, specId);
    const sections = await this.ensureSections(instance, definition);
    const spec: AgentSpecRecord = {
      specId,
      instanceId: instance.instanceId,
      definitionId: definition.definitionId,
      sectionIds: sections.map((section) => section.sectionId),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    await this.storage.putRecord(OWNER_ID, SPECS, specId, spec);
    await this.ensureAppearancePreference(instance.instanceId);
    await this.ensureDefaultWorkflow(instance, definition);
    return spec;
  }

  private async ensureSections(
    instance: AgentInstanceRecord,
    definition: AgentDefinitionRecord
  ): Promise<AgentSectionRecord[]> {
    const now = new Date().toISOString();
    const defaults = defaultSections(instance, definition);
    const sections: AgentSectionRecord[] = [];
    for (const item of defaults) {
      const sectionId = `section:${instance.instanceId}:${item.kind}`;
      const existing = await this.storage.getRecord<AgentSectionRecord>(OWNER_ID, SECTIONS, sectionId);
      const section: AgentSectionRecord = {
        sectionId,
        instanceId: instance.instanceId,
        kind: item.kind,
        label: item.label,
        state: existing?.state ?? "active",
        body: existing?.body ?? item.body,
        createdAt: existing?.createdAt ?? now,
        updatedAt: existing?.updatedAt ?? now
      };
      await this.storage.putRecord(OWNER_ID, SECTIONS, sectionId, section);
      sections.push(section);
    }
    return sections;
  }

  private async ensureAppearancePreference(instanceId: string): Promise<AgentAppearancePreferenceRecord> {
    const preferenceId = `appearance:${instanceId}`;
    const existing = await this.storage.getRecord<AgentAppearancePreferenceRecord>(
      OWNER_ID,
      APPEARANCE_PREFERENCES,
      preferenceId
    );
    if (existing) {
      return existing;
    }
    const preference: AgentAppearancePreferenceRecord = {
      preferenceId,
      instanceId,
      density: "comfortable",
      accent: "#2563eb",
      updatedAt: new Date().toISOString()
    };
    await this.storage.putRecord(OWNER_ID, APPEARANCE_PREFERENCES, preferenceId, preference);
    return preference;
  }

  private async ensureDefaultWorkflow(
    instance: AgentInstanceRecord,
    definition: AgentDefinitionRecord
  ): Promise<AgentWorkflowRecord> {
    const workflowId = `workflow:${instance.instanceId}:manual`;
    const existing = await this.storage.getRecord<AgentWorkflowRecord>(OWNER_ID, WORKFLOWS, workflowId);
    if (existing) {
      return existing;
    }
    const now = new Date().toISOString();
    const workflow: AgentWorkflowRecord = {
      workflowId,
      instanceId: instance.instanceId,
      label: "Manual Review",
      instruction: definition.remit,
      toolIds: definition.toolManifest,
      packageIds: [],
      triggerIds: ["manual"],
      triggers: [
        {
          triggerId: "manual",
          kind: "manual",
          label: "Manual",
          enabled: true
        }
      ],
      manualOrder: 100,
      targetPolicy: {
        include: [],
        exclude: []
      },
      enabled: true,
      createdAt: now,
      updatedAt: now
    };
    await this.storage.putRecord(OWNER_ID, WORKFLOWS, workflowId, workflow);
    return workflow;
  }

  private async refreshToolAccessSection(instanceId: string): Promise<void> {
    const [assignments, permissions] = await Promise.all([
      this.listCapabilityAssignments(instanceId),
      this.listToolFilePermissions(instanceId)
    ]);
    await this.updateSection(instanceId, "tool-access", {
      grantedCapabilities: assignments.filter((assignment) => assignment.status === "granted"),
      unavailableCapabilities: assignments.filter((assignment) => assignment.status === "unavailable"),
      toolFilePermissions: permissions,
      projectionOnly: "Flat tool lists are compatibility projections; grants and permissions are source records."
    });
  }

  private async refreshVisibilitySection(instanceId: string): Promise<void> {
    const files = await this.listFileAssignments(instanceId);
    await this.updateSection(instanceId, "visibility-scope", {
      fileAssignments: files,
      visibleCount: files.filter((file) => file.visibility === "visible").length,
      globalEligibleCount: files.filter((file) => file.globalToolEligible).length
    });
  }

  private async refreshWorkflowSection(instanceId: string): Promise<void> {
    const workflows = await this.listWorkflows(instanceId);
    await this.updateSection(instanceId, "workflow", {
      workflows,
      enabledCount: workflows.filter((workflow) => workflow.enabled).length,
      executorBoundaryRequired: true
    });
  }

  private async requireWorkflow(instanceId: string, workflowId: string): Promise<AgentWorkflowRecord> {
    const workflow = await this.storage.getRecord<AgentWorkflowRecord>(OWNER_ID, WORKFLOWS, workflowId);
    if (!workflow || workflow.instanceId !== instanceId) {
      throw new Error(`Workflow ${workflowId} was not found for ${instanceId}.`);
    }
    return workflow;
  }

  private async requireInstance(instanceId: string): Promise<AgentInstanceRecord> {
    const instance = await this.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Agent instance ${instanceId} was not found.`);
    }
    return instance;
  }

  private async requireDefinition(definitionId: string): Promise<AgentDefinitionRecord> {
    const definition = await this.storage.getRecord<AgentDefinitionRecord>(
      OWNER_ID,
      DEFINITIONS,
      definitionId
    );
    if (!definition) {
      throw new Error(`Agent definition ${definitionId} was not found.`);
    }
    return definition;
  }
}

function defaultSections(
  instance: AgentInstanceRecord,
  definition: AgentDefinitionRecord
): Array<Pick<AgentSectionRecord, "kind" | "label" | "body">> {
  return [
    {
      kind: "identity",
      label: "Identity",
      body: {
        instanceId: instance.instanceId,
        definitionId: definition.definitionId,
        label: instance.label,
        remit: definition.remit
      }
    },
    {
      kind: "tool-access",
      label: "Tool Access",
      body: {
        toolManifest: definition.toolManifest,
        grantedCapabilities: [],
        toolFilePermissions: [],
        projectionOnly: "Tool manifests are compatibility projections; grants and permissions are source records."
      }
    },
    {
      kind: "activation",
      label: "Activation",
      body: {
        state: instance.state,
        active: instance.state === "active",
        singleGate: "Agent activation is enforced by the instance state record."
      }
    },
    {
      kind: "current-state",
      label: "Current State",
      body: {
        updatedAt: instance.updatedAt,
        state: instance.state
      }
    },
    {
      kind: "persistent-state",
      label: "Persistent State",
      body: {
        createdAt: instance.createdAt,
        memoryRegionCount: instance.memory.length
      }
    },
    {
      kind: "recorded-memory",
      label: "Recorded Memory",
      body: {
        memory: instance.memory
      }
    },
    {
      kind: "working-memory",
      label: "Working Memory",
      body: {
        notes: []
      }
    },
    {
      kind: "notes",
      label: "Notes",
      body: {
        notes: []
      }
    },
    {
      kind: "visibility-scope",
      label: "Visibility Scope",
      body: {
        fileAssignments: [],
        globalEligibleCount: 0
      }
    },
    {
      kind: "workflow",
      label: "Workflow",
      body: {
        triggers: definition.triggers,
        executorBoundaryRequired: true
      }
    }
  ];
}

async function readJsonFile<T>(target: string): Promise<T | undefined> {
  try {
    const raw = await readFile(target, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function normalizeId(value: string): string {
  return value
    .trim()
    .replace(/[\\/]+/g, ".")
    .replace(/[^A-Za-z0-9._-]+/g, "_");
}

function normalizePathKey(value: string): string {
  return value
    .trim()
    .replace(/[\\/]+/g, ".")
    .replace(/[^A-Za-z0-9._:-]+/g, "_");
}

function matchesAny(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const normalized = pattern.trim();
    if (!normalized) {
      return false;
    }
    if (normalized.endsWith("*")) {
      return value.startsWith(normalized.slice(0, -1));
    }
    return value.includes(normalized);
  });
}

function pathCovers(permissionPath: string, targetPath: string): boolean {
  const normalizedPermission = permissionPath.replace(/\\/g, "/").replace(/\/+$/g, "");
  const normalizedTarget = targetPath.replace(/\\/g, "/");
  return (
    normalizedTarget === normalizedPermission ||
    normalizedTarget.startsWith(`${normalizedPermission}/`)
  );
}

function dedupeMemory(regions: AgentMemoryRegion[]): AgentMemoryRegion[] {
  const seen = new Set<string>();
  return regions.filter((region) => {
    if (seen.has(region.regionId)) {
      return false;
    }
    seen.add(region.regionId);
    return true;
  });
}

const DEFAULT_DEFINITIONS: AgentDefinitionRecord[] = [
  {
    definitionId: "agent.sherlock",
    label: "Sherlock",
    remit: "Inspect architecture, detect ownership drift, and flag boundary violations.",
    toolManifest: ["filesystem.read", "repo-analysis"],
    triggers: ["manual", "platform-change"]
  },
  {
    definitionId: "agent.warden",
    label: "Warden",
    remit: "Observe runtime posture and surface degraded states across owner boundaries.",
    toolManifest: ["runtime.inspect"],
    triggers: ["manual"]
  }
];
