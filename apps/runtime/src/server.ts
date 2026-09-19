import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { AgentsDomainService, createAgentsContainer } from "../../../owners/agents/src/index.js";
import { CapabilityPlatformService, createCapabilityPlatformContainer } from "../../../owners/capability-platform/src/index.js";
import { CoordinationLayerService, createCoordinationContainer } from "../../../owners/coordination/src/index.js";
import {
  BoundedExecutorService,
  createExecutionEnvironmentContainer,
  ExecutionEnvironmentDomainService
} from "../../../owners/execution-environment/src/index.js";
import { createFrameworkDiagnosticsContainer, FrameworkHostRuntime } from "../../../owners/framework/src/index.js";
import { createIntegrationContainer, IntegrationLayerService } from "../../../owners/integration/src/index.js";
import { createStorageContainer, StorageSubstrateService } from "../../../owners/storage/src/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot =
  process.env.SKELETON_PROJECT_ROOT?.trim() ||
  process.env.SKELETON_REBUILD_WORKSPACE_ROOT?.trim() ||
  resolveProjectRoot(here);
const legacyRoot = process.env.SKELETON_LEGACY_ROOT?.trim();
const dataRoot =
  process.env.SKELETON_DATA_ROOT?.trim() ||
  process.env.SKELETON_REBUILD_DATA_ROOT?.trim() ||
  path.join(workspaceRoot, ".skeleton-data");
const port = Number(process.env.PORT ?? 4310);
const shellDistRoot = path.join(workspaceRoot, "apps", "shell", "dist");

const storage = new StorageSubstrateService(dataRoot);
const coordination = new CoordinationLayerService(storage);
const executor = new BoundedExecutorService(storage);
const environments = new ExecutionEnvironmentDomainService(storage, () => executor.inspectObservability());
const integration = new IntegrationLayerService(storage, coordination);
const agents = new AgentsDomainService(storage, coordination);
const capabilityPlatform = new CapabilityPlatformService(storage, coordination, environments);
const framework = new FrameworkHostRuntime({
  title: "Skeleton Rebuild",
  runtimeVersion: "2.0.0-rebuild",
  workspaceRoot,
  dataRoot,
  startedAt: new Date().toISOString()
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

void start();

async function start(): Promise<void> {
  await environments.registerEnvironment({
    environmentId: "capability-platform",
    ownerId: "capability-platform",
    label: "Capability Platform Environment",
    summary: "Bounded place for capability package workbench, lifecycle ledger, and platform observability.",
    stations: [
      {
        stationId: "package-workbench",
        label: "Package Workbench",
        ownerId: "capability-platform",
        purpose: "Author drafts, validate package truth, and publish through the lifecycle gate.",
        actionIds: ["draft.save", "package.validate", "package.publish"]
      },
      {
        stationId: "lifecycle-ledger",
        label: "Lifecycle Ledger",
        ownerId: "capability-platform",
        purpose: "Inspect drafts, publications, release forms, package events, and rollback publications.",
        actionIds: ["history.read", "forms.read", "rollback.publish"]
      },
      {
        stationId: "surface-policy",
        label: "Surface Policy",
        ownerId: "capability-platform",
        purpose: "Inspect package surface policy and source registrations.",
        actionIds: ["policy.read", "source.read"]
      }
    ],
    rules: [
      {
        ruleId: "package-truth-owner",
        summary: "Package truth stays in Capability Platform; consumers request governed surfaces.",
        enforcement: "blocking"
      },
      {
        ruleId: "executor-boundary",
        summary: "Published forms are artifacts; authored package code is not directly executed by the environment.",
        enforcement: "blocking"
      }
    ],
    settings: {
      lifecycle: "static",
      readinessChecks: ["package-lifecycle-records", "storage-artifact-custody", "surface-policies"],
      ownerRefs: ["capability-platform"]
    },
    skins: [
      {
        skinId: "capability-default",
        label: "Capability Default",
        ownerId: "capability-platform"
      }
    ]
  });
  await environments.registerEnvironment({
    environmentId: "agent-hall",
    ownerId: "agents",
    label: "Agent Hall",
    summary: "Bounded place for agent selection, bay readiness, permissions, workflows, and appearance posture.",
    stations: [
      {
        stationId: "agent-bay",
        label: "Agent Bay",
        ownerId: "agents",
        purpose: "Inspect a selected agent's spec sections, readiness, memory, and activation posture.",
        actionIds: ["agent.inspect", "agent.activate", "agent.section.update"]
      },
      {
        stationId: "keycard",
        label: "Keycard",
        ownerId: "agents",
        purpose: "Manage file and folder visibility separately from per-tool file permissions.",
        actionIds: ["file.assign", "file.visibility.read", "permission.write"]
      },
      {
        stationId: "workflow",
        label: "Workflow",
        ownerId: "agents",
        purpose: "Author workflow entries, preview targets, enforce runtime permissions, and submit allowed runs to the bounded executor.",
        actionIds: ["workflow.write", "workflow.preview", "workflow.request-run"]
      }
    ],
    rules: [
      {
        ruleId: "activation-gate",
        summary: "Agent activity is gated by the Agents instance state.",
        enforcement: "blocking"
      },
      {
        ruleId: "workflow-executor-boundary",
        summary: "Workflow run requests must pass Agents runtime permission checks before bounded executor handoff.",
        enforcement: "blocking"
      }
    ],
    settings: {
      lifecycle: "instance",
      readinessChecks: ["agent-spec", "permission-posture", "workflow-target-preview"],
      ownerRefs: ["agents"]
    },
    skins: [
      {
        skinId: "agent-default",
        label: "Agent Default",
        ownerId: "agents"
      }
    ]
  });
  await environments.registerEnvironment({
    environmentId: "change-session-workspace",
    ownerId: "coordination",
    label: "Change Session Workspace",
    summary: "Bounded place for governed change-session truth, workflow evidence, and lifecycle inspection.",
    stations: [
      {
        stationId: "session-ledger",
        label: "Session Ledger",
        ownerId: "coordination",
        purpose: "Inspect imported change-session handoff and routing evidence.",
        actionIds: ["session.read", "handoff.read"]
      }
    ],
    rules: [
      {
        ruleId: "coordination-thinness",
        summary: "Coordination records handoff metadata without owning package or agent semantics.",
        enforcement: "blocking"
      }
    ],
    settings: {
      lifecycle: "session",
      readinessChecks: ["session-imported-or-pending"],
      ownerRefs: ["coordination"]
    }
  });

  framework.registerContainer(createFrameworkDiagnosticsContainer());
  framework.registerContainer(createAgentsContainer());
  framework.registerContainer(createCapabilityPlatformContainer());
  framework.registerContainer(createCoordinationContainer());
  framework.registerContainer(createExecutionEnvironmentContainer());
  framework.registerContainer(createIntegrationContainer());
  framework.registerContainer(createStorageContainer());

  await integration.initialize();
  await agents.initialize();
  await capabilityPlatform.initialize();

  registerRoutes();

  app.listen(port, "127.0.0.1", () => {
    console.log(`[rebuild-runtime] listening on http://127.0.0.1:${port}`);
  });
}

function registerRoutes(): void {
  app.get("/api/health", async (_request, response) => {
    const handoffs = await coordination.listRecent(10);
    response.json({
      status: "ok",
      ready: true,
      workspaceRoot,
      dataRoot,
      containerCount: framework.listContainers().length,
      environmentCount: environments.listEnvironments().length,
      handoffCount: handoffs.length
    });
  });

  app.get("/api/framework/bootstrap", (_request, response) => {
    response.json(
      framework.createBootstrap({
        environments: environments.listEnvironments(),
        nativeBridge: {
          desktop: process.env.SKELETON_REBUILD_DESKTOP === "1",
          openPath: process.env.SKELETON_REBUILD_DESKTOP === "1"
        }
      })
    );
  });

  app.get("/api/framework/diagnostics", async (_request, response) => {
    const recent = await coordination.listRecent(20);
    response.json(
      framework.createDiagnostics({
        environments: environments.listEnvironments(),
        coordination: {
          eventCount: recent.length,
          recentEvents: recent.map((event) => ({
            eventId: event.eventId,
            ownerId: event.ownerId,
            type: event.type,
            summary: event.summary,
            createdAt: event.createdAt
          }))
        }
      })
    );
  });

  app.get("/api/execution-environment/environments", (_request, response) => {
    response.json(environments.listEnvironments());
  });

  app.get("/api/execution-environment/observability", async (_request, response, next) => {
    try {
      response.json(await environments.inspectObservability());
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/execution-environment/environments/:environmentId/state", async (request, response, next) => {
    try {
      await environments.updateState({
        environmentId: request.params.environmentId,
        status:
          request.body?.status === "ready" || request.body?.status === "degraded"
            ? request.body.status
            : "pending",
        ready: Boolean(request.body?.ready),
        summary: String(request.body?.summary ?? "")
      });
      response.json(await environments.inspectObservability());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/execution-environment/executor/runs", async (_request, response, next) => {
    try {
      response.json(await executor.listRuns(100));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/execution-environment/executor/runs/:runId", async (request, response, next) => {
    try {
      const run = await executor.getRun(request.params.runId);
      if (!run) {
        response.status(404).json({ error: "Executor run not found." });
        return;
      }
      response.json(run);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/capability-platform/packages", async (_request, response, next) => {
    try {
      response.json(await capabilityPlatform.listPackages());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/capability-platform/packages/:packageId", async (request, response, next) => {
    try {
      const detail = await capabilityPlatform.getPackage(request.params.packageId);
      if (!detail) {
        response.status(404).json({ error: "Capability package not found." });
        return;
      }
      response.json(detail);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/capability-platform/packages/:packageId/surfaces/:surfaceId", async (request, response, next) => {
    try {
      const surfaceId = String(request.params.surfaceId);
      if (!isCapabilitySurfaceId(surfaceId)) {
        response.status(400).json({ error: "Unknown capability surface." });
        return;
      }
      const detail = await capabilityPlatform.getPackageSurface(request.params.packageId, surfaceId);
      if (!detail) {
        response.status(404).json({ error: "Capability package not found." });
        return;
      }
      response.json(detail);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/capability-platform/packages/:packageId/draft", async (request, response, next) => {
    try {
      response.json(
        await capabilityPlatform.saveDraft(request.params.packageId, {
          name: String(request.body?.name ?? ""),
          description: String(request.body?.description ?? ""),
          entrypoint: String(request.body?.entrypoint ?? ""),
          sourceText: String(request.body?.sourceText ?? ""),
          metadata:
            request.body?.metadata && typeof request.body.metadata === "object"
              ? request.body.metadata
              : {}
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/capability-platform/packages/:packageId/validate", async (request, response, next) => {
    try {
      response.json(await capabilityPlatform.validatePackage(request.params.packageId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/capability-platform/packages/:packageId/publish", async (request, response, next) => {
    try {
      response.json(await capabilityPlatform.publishPackage(request.params.packageId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/capability-platform/packages/:packageId/rollback", async (request, response, next) => {
    try {
      response.json(
        await capabilityPlatform.rollbackPackage(
          request.params.packageId,
          String(request.body?.releaseId ?? "")
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/capability-platform/packages/:packageId/actions/run", async (request, response, next) => {
    try {
      const surfaceId = String(request.body?.surfaceId ?? "published");
      const result = await capabilityPlatform.executeGovernedPackageAction(executor, {
        packageId: request.params.packageId,
        requestedByOwnerId: String(request.body?.requestedByOwnerId ?? "capability-platform"),
        ...(request.body?.requestedByRecordId
          ? { requestedByRecordId: String(request.body.requestedByRecordId) }
          : {}),
        surfaceId: isCapabilitySurfaceId(surfaceId) ? surfaceId : "published",
        ...(request.body?.grantEvidence && typeof request.body.grantEvidence === "object"
          ? {
              grantEvidence: {
                ownerId: String(request.body.grantEvidence.ownerId ?? ""),
                grantId: String(request.body.grantEvidence.grantId ?? ""),
                surfaceIds: Array.isArray(request.body.grantEvidence.surfaceIds)
                  ? request.body.grantEvidence.surfaceIds.map(String)
                  : [],
                ...(request.body.grantEvidence.scope === "global" ||
                request.body.grantEvidence.scope === "local"
                  ? { scope: request.body.grantEvidence.scope }
                  : {})
              }
            }
          : {}),
        payload:
          request.body?.payload && typeof request.body.payload === "object"
            ? request.body.payload
            : {}
      });
      response.status(result.executorRun.status === "denied" ? 403 : 200).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/capability-platform/observability", async (_request, response, next) => {
    try {
      response.json(await capabilityPlatform.inspectObservability());
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/capability-platform/import/legacy-prompts", async (_request, response, next) => {
    try {
      response.json(
        await capabilityPlatform.importLegacyPromptPackages(resolveLegacyDatabaseRoots(legacyRoot))
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/integration/providers", async (_request, response, next) => {
    try {
      response.json(await integration.listProviderStatus());
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/integration/providers/openai/credentials", async (request, response, next) => {
    try {
      response.json(
        await integration.saveOpenAiCredential({
          apiKey: String(request.body?.apiKey ?? ""),
          ...(request.body?.baseUrl ? { baseUrl: String(request.body.baseUrl) } : {})
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/integration/providers/openai/credentials", async (_request, response, next) => {
    try {
      response.json(await integration.clearOpenAiCredential());
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/integration/mode", async (request, response, next) => {
    try {
      response.json(await integration.setMode(request.body?.mode === "online" ? "online" : "offline"));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/integration/observability", async (_request, response, next) => {
    try {
      response.json(await integration.inspectObservability());
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/integration/import/legacy-provider-inventory", async (_request, response, next) => {
    try {
      response.json(
        await integration.importLegacyProviderInventory({
          configRoots: resolveLegacyDatabaseDomainRoots(legacyRoot),
          catalogRoots: resolveLegacyProviderCatalogRoots(legacyRoot)
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/definitions", async (_request, response, next) => {
    try {
      response.json(await agents.listDefinitions());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents", async (_request, response, next) => {
    try {
      response.json(await agents.listInstances());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/packages", async (_request, response, next) => {
    try {
      response.json(await agents.listPackages());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/observability", async (_request, response, next) => {
    try {
      response.json(await agents.inspectObservability());
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/import/legacy", async (_request, response, next) => {
    try {
      response.json(await agents.importLegacyAgents(resolveLegacyAgentRoots(legacyRoot)));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/spec", async (request, response, next) => {
    try {
      response.json(await agents.getSpec(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/sections", async (request, response, next) => {
    try {
      response.json(await agents.listSections(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/agents/:instanceId/sections/:kind", async (request, response, next) => {
    try {
      const kind = String(request.params.kind);
      if (!isAgentSectionKind(kind)) {
        response.status(400).json({ error: "Unknown agent section kind." });
        return;
      }
      response.json(
        await agents.updateSection(
          request.params.instanceId,
          kind,
          request.body?.body && typeof request.body.body === "object" ? request.body.body : {}
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/capability-assignments", async (request, response, next) => {
    try {
      response.json(await agents.listCapabilityAssignments(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/:instanceId/capability-assignments", async (request, response, next) => {
    try {
      response.json(
        await agents.grantCapability({
          instanceId: request.params.instanceId,
          packageId: String(request.body?.packageId ?? ""),
          surfaceIds: Array.isArray(request.body?.surfaceIds)
            ? request.body.surfaceIds.map(String)
            : undefined,
          scope: request.body?.scope === "global" ? "global" : "local",
          ...(request.body?.reason ? { reason: String(request.body.reason) } : {})
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/agents/:instanceId/capability-assignments/:assignmentId", async (request, response, next) => {
    try {
      response.json(
        await agents.revokeCapability(
          request.params.instanceId,
          request.params.assignmentId,
          request.body?.reason ? String(request.body.reason) : undefined
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/files", async (request, response, next) => {
    try {
      response.json(await agents.listFileAssignments(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/:instanceId/files", async (request, response, next) => {
    try {
      response.json(
        await agents.assignFile({
          instanceId: request.params.instanceId,
          path: String(request.body?.path ?? ""),
          kind: request.body?.kind === "folder" ? "folder" : "file",
          ...(request.body?.root ? { root: String(request.body.root) } : {}),
          ...(request.body?.relativePath ? { relativePath: String(request.body.relativePath) } : {}),
          globalToolEligible: Boolean(request.body?.globalToolEligible)
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/tool-file-permissions", async (request, response, next) => {
    try {
      response.json(await agents.listToolFilePermissions(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/:instanceId/tool-file-permissions", async (request, response, next) => {
    try {
      response.json(
        await agents.setToolFilePermission({
          instanceId: request.params.instanceId,
          toolId: String(request.body?.toolId ?? ""),
          path: String(request.body?.path ?? ""),
          access: isToolFileAccess(request.body?.access) ? request.body.access : "read",
          scope: request.body?.scope === "global" ? "global" : "local",
          source: request.body?.source === "global-sync" ? "global-sync" : "direct"
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/workflows", async (request, response, next) => {
    try {
      response.json(await agents.listWorkflows(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/:instanceId/workflows", async (request, response, next) => {
    try {
      response.json(
        await agents.upsertWorkflow(request.params.instanceId, {
          workflowId: request.body?.workflowId ? String(request.body.workflowId) : undefined,
          label: String(request.body?.label ?? "Workflow"),
          instruction: String(request.body?.instruction ?? ""),
          toolIds: Array.isArray(request.body?.toolIds) ? request.body.toolIds.map(String) : undefined,
          packageIds: Array.isArray(request.body?.packageIds) ? request.body.packageIds.map(String) : undefined,
          manualOrder: Number(request.body?.manualOrder ?? 100),
          enabled: request.body?.enabled !== false,
          targetPolicy:
            request.body?.targetPolicy && typeof request.body.targetPolicy === "object"
              ? {
                  root: request.body.targetPolicy.root
                    ? String(request.body.targetPolicy.root)
                    : undefined,
                  include: Array.isArray(request.body.targetPolicy.include)
                    ? request.body.targetPolicy.include.map(String)
                    : [],
                  exclude: Array.isArray(request.body.targetPolicy.exclude)
                    ? request.body.targetPolicy.exclude.map(String)
                    : []
                }
              : undefined
        })
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/workflows/:workflowId/target-preview", async (request, response, next) => {
    try {
      response.json(
        await agents.previewWorkflowTargets(request.params.instanceId, request.params.workflowId)
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/workflow-runs", async (request, response, next) => {
    try {
      response.json(await agents.listWorkflowRuns(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/:instanceId/workflows/:workflowId/run", async (request, response, next) => {
    try {
      const run = await agents.requestWorkflowRun(
        request.params.instanceId,
        request.params.workflowId,
        executor,
        (input) => capabilityPlatform.authorizePackageAction(input)
      );
      response.status(run.status === "blocked" ? 403 : 200).json(run);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId/environment-context", async (request, response, next) => {
    try {
      response.json(await agents.getEnvironmentContext(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:instanceId", async (request, response, next) => {
    try {
      const instance = await agents.getInstance(request.params.instanceId);
      if (!instance) {
        response.status(404).json({ error: "Agent instance not found." });
        return;
      }
      response.json(instance);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/agents/:instanceId/state", async (request, response, next) => {
    try {
      response.json(
        await agents.setInstanceState(
          request.params.instanceId,
          request.body?.state === "active" ? "active" : "inactive"
        )
      );
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/:instanceId/export", async (request, response, next) => {
    try {
      response.json(await agents.exportInstance(request.params.instanceId));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/coordination/observability", async (_request, response, next) => {
    try {
      response.json(await coordination.inspectObservability());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/coordination/workflows", async (_request, response, next) => {
    try {
      response.json(await coordination.listWorkflows());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/coordination/change-sessions", async (_request, response, next) => {
    try {
      response.json(await coordination.listChangeSessions());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/coordination/change-sessions/:sessionId", async (request, response, next) => {
    try {
      const detail = await coordination.getChangeSession(request.params.sessionId);
      if (!detail) {
        response.status(404).json({ error: "Change session not found." });
        return;
      }
      response.json(detail);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/coordination/import/legacy-change-workflows", async (_request, response, next) => {
    try {
      const report = await coordination.importLegacyChangeWorkflows(
        resolveLegacyDatabaseRoots(legacyRoot)
      );
      await environments.updateState({
        environmentId: "change-session-workspace",
        status: report.importedSessions.length > 0 ? "ready" : "pending",
        ready: report.importedSessions.length > 0,
        summary:
          report.importedSessions.length > 0
            ? `Change session workspace is mounted with ${report.importedSessions.length} imported session(s).`
            : "Change session workspace is registered but has no imported sessions yet."
      });
      response.json(report);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/storage/observability", async (_request, response, next) => {
    try {
      response.json(await storage.inspectObservability());
    } catch (error) {
      next(error);
    }
  });

  app.use(
    (
      error: unknown,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction
    ) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      response.status(500).json({ error: message });
    }
  );

  if (existsSync(shellDistRoot)) {
    app.use(express.static(shellDistRoot));
    app.get("*", (request, response, next) => {
      if (request.path.startsWith("/api/")) {
        next();
        return;
      }
      response.sendFile(path.join(shellDistRoot, "index.html"));
    });
    return;
  }

  app.get("/", (_request, response) => {
    response.type("html").send(
      [
        "<!doctype html>",
        "<html><body style=\"font-family:Segoe UI,sans-serif;padding:24px\">",
        "<h1>Skeleton Rebuild Runtime</h1>",
        "<p>The new runtime is running, but the shell has not been built yet.</p>",
        "<p>Run <code>npm run build:shell</code> inside <code>rebuild/</code> to mount the new host shell.</p>",
        "</body></html>"
      ].join("")
    );
  });
}

function isCapabilitySurfaceId(value: string): value is "published" | "unpublished" | "history" | "artifact" | "policy" | "admin" {
  return ["published", "unpublished", "history", "artifact", "policy", "admin"].includes(value);
}

function isAgentSectionKind(
  value: string
): value is
  | "identity"
  | "tool-access"
  | "activation"
  | "current-state"
  | "persistent-state"
  | "recorded-memory"
  | "working-memory"
  | "notes"
  | "visibility-scope"
  | "workflow" {
  return [
    "identity",
    "tool-access",
    "activation",
    "current-state",
    "persistent-state",
    "recorded-memory",
    "working-memory",
    "notes",
    "visibility-scope",
    "workflow"
  ].includes(value);
}

function isToolFileAccess(value: unknown): value is "read" | "write" | "execute" | "deny" {
  return value === "read" || value === "write" || value === "execute" || value === "deny";
}

function resolveProjectRoot(start: string): string {
  let current = path.resolve(start);
  for (;;) {
    const packageJson = path.join(current, "package.json");
    const appsRoot = path.join(current, "apps");
    const ownersRoot = path.join(current, "owners");
    if (existsSync(packageJson) && existsSync(appsRoot) && existsSync(ownersRoot)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error(`Unable to locate Skeleton project root from ${start}`);
    }
    current = parent;
  }
}

function resolveLegacyDatabaseRoots(root: string | undefined): string[] {
  if (!root) {
    return [];
  }
  return [
    path.join(root, ".data-runtime", "database"),
    path.join(root, ".data", "database")
  ].filter((candidate, index, array) => array.indexOf(candidate) === index && existsSync(candidate));
}

function resolveLegacyDatabaseDomainRoots(root: string | undefined): string[] {
  if (!root) {
    return [];
  }
  return [
    path.join(root, ".data-runtime", "database-domain"),
    path.join(root, ".data", "database-domain")
  ].filter((candidate, index, array) => array.indexOf(candidate) === index && existsSync(candidate));
}

function resolveLegacyProviderCatalogRoots(root: string | undefined): string[] {
  return resolveLegacyDatabaseRoots(root)
    .map((databaseRoot) => path.join(databaseRoot, "model-truth", "providers"))
    .filter((candidate, index, array) => array.indexOf(candidate) === index && existsSync(candidate));
}

function resolveLegacyAgentRoots(root: string | undefined): string[] {
  return [...resolveLegacyDatabaseDomainRoots(root), ...resolveLegacyDatabaseRoots(root)].filter(
    (candidate, index, array) => array.indexOf(candidate) === index && existsSync(candidate)
  );
}
