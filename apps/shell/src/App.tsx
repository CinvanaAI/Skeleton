import { useEffect, useMemo, useState } from "react";
import type {
  AgentDefinitionRecord,
  AgentEnvironmentContext,
  AgentFileAssignmentRecord,
  AgentInstanceRecord,
  AgentPackageRecord,
  AgentSectionRecord,
  AgentToolFilePermissionRecord,
  AgentWorkflowRecord,
  AgentWorkflowRunRecord,
  AgentWorkflowTargetPreview,
  AgentsObservability,
  LegacyAgentsImportReport
} from "../../../owners/agents/src/index.js";
import type {
  CapabilityPackageActionAuthorization,
  CapabilityPackageActionExecutionRecord,
  CapabilityPackageDetail,
  CapabilityPackageSurfaceDetail,
  CapabilityPackageSummary,
  CapabilityPlatformObservability,
  CapabilityValidationResult,
  LegacyCapabilityImportReport
} from "../../../owners/capability-platform/src/index.js";
import type {
  ChangeSessionDetail,
  ChangeSessionSummary,
  CoordinationObservability,
  LegacyCoordinationImportReport,
  WorkflowDefinitionRecord
} from "../../../owners/coordination/src/index.js";
import type {
  BoundedExecutorRunRecord,
  ExecutionEnvironmentObservability
} from "../../../owners/execution-environment/src/index.js";
import type {
  FrameworkDiagnostics,
  HostBootstrapPayload
} from "../../../owners/framework/src/index.js";
import type {
  IntegrationObservability,
  LegacyIntegrationImportReport,
  ProviderStatusRecord
} from "../../../owners/integration/src/index.js";
import type { StorageObservability } from "../../../owners/storage/src/index.js";

declare global {
  interface Window {
    skeletonDesktop?: {
      getPlatformRoots: () => Promise<{
        workspaceRoot: string;
        dataRoot: string;
      }>;
      openPath: (target: string) => Promise<string>;
    };
  }
}

const apiBaseUrl = `${window.location.origin}/api`;

type CapabilityActionRunResponse = {
  authorization: CapabilityPackageActionAuthorization;
  executorRun: BoundedExecutorRunRecord;
  evidence: CapabilityPackageActionExecutionRecord;
};

export function App() {
  const [bootstrap, setBootstrap] = useState<HostBootstrapPayload | null>(null);
  const [error, setError] = useState("");
  const [activeContainerId, setActiveContainerId] = useState("capability-platform");
  const [activeSurfaceId, setActiveSurfaceId] = useState("capability-workbench");

  useEffect(() => {
    void loadBootstrap();
  }, []);

  const activeContainer = useMemo(
    () =>
      bootstrap?.containers.find((container) => container.containerId === activeContainerId) ??
      bootstrap?.containers[0] ??
      null,
    [bootstrap, activeContainerId]
  );

  useEffect(() => {
    if (!activeContainer) {
      return;
    }
    if (activeContainer.containerId !== activeContainerId) {
      setActiveContainerId(activeContainer.containerId);
      return;
    }
    const chosenSurface =
      activeContainer.surfaces.find((surface) => surface.surfaceId === activeSurfaceId) ??
      activeContainer.surfaces[0];
    if (chosenSurface && chosenSurface.surfaceId !== activeSurfaceId) {
      setActiveSurfaceId(chosenSurface.surfaceId);
    }
  }, [activeContainer, activeContainerId, activeSurfaceId]);

  async function loadBootstrap() {
    try {
      setBootstrap(await request<HostBootstrapPayload>("/framework/bootstrap"));
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    }
  }

  return (
    <div className="shell-root">
      <aside className="container-rail">
        <div className="brand-block">
          <div className="eyebrow">A workbench for reusable capabilities</div>
          <h1>Skeleton</h1>
          <p>
            Inspect the code. Publish a local version. Give it permission to run.
            Keep a record of the result.
          </p>
        </div>

        <div className="rail-section">
          <div className="section-label">Workspaces</div>
          {bootstrap?.containers.map((container) => (
            <button
              key={container.containerId}
              className={
                container.containerId === activeContainer?.containerId
                  ? "rail-button active"
                  : "rail-button"
              }
              onClick={() => setActiveContainerId(container.containerId)}
            >
              <strong>{container.label}</strong>
            </button>
          ))}
        </div>

        <div className="rail-section">
          <div className="section-label">Environments</div>
          {bootstrap?.environments.map((environment) => (
            <article key={environment.environmentId} className="rail-card">
              <strong>{environment.label}</strong>
              <span>{environment.status}</span>
              <p>{environment.summary}</p>
            </article>
          ))}
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <div className="eyebrow">Local prototype</div>
            <h2>{activeContainer?.label ?? "Loading"}</h2>
            <p className="muted">{activeContainer?.summary ?? "Loading container definition."}</p>
          </div>
          <div className="header-meta">
            <span>{bootstrap?.platform.runtimeVersion ?? "..."}</span>
            <details><summary>Workspace location</summary><code>{bootstrap?.platform.workspaceRoot ?? "..."}</code></details>
          </div>
        </header>

        <nav className="surface-tabs">
          {activeContainer?.surfaces.map((surface) => (
            <button
              key={surface.surfaceId}
              className={surface.surfaceId === activeSurfaceId ? "active" : ""}
              onClick={() => setActiveSurfaceId(surface.surfaceId)}
            >
              {surface.label}
            </button>
          )) ?? null}
        </nav>

        {error ? <div className="banner error">{error}</div> : null}

        <section className="surface-root">
          {bootstrap && activeContainer && activeSurfaceId === "host-diagnostics" ? (
            <FrameworkDiagnosticsSurface bootstrap={bootstrap} />
          ) : null}

          {activeContainer?.containerId === "capability-platform" &&
          activeSurfaceId === "capability-workbench" ? (
            <CapabilityWorkbenchSurface />
          ) : null}

          {activeContainer?.containerId === "capability-platform" &&
          activeSurfaceId === "capability-observability" ? (
            <CapabilityObservabilitySurface />
          ) : null}

          {activeContainer?.containerId === "capability-platform" &&
          activeSurfaceId === "capability-lifecycle-ledger" ? (
            <CapabilityLifecycleLedgerSurface />
          ) : null}

          {activeContainer?.containerId === "capability-platform" &&
          activeSurfaceId === "capability-policy-admin" ? (
            <CapabilityPolicyAdminSurface />
          ) : null}

          {activeContainer?.containerId === "agents" && activeSurfaceId === "agents-workbench" ? (
            <AgentsWorkbenchSurface />
          ) : null}

          {activeContainer?.containerId === "agents" && activeSurfaceId === "agents-permissions" ? (
            <AgentsPermissionsSurface />
          ) : null}

          {activeContainer?.containerId === "agents" && activeSurfaceId === "agents-workflows" ? (
            <AgentsWorkflowsSurface />
          ) : null}

          {activeContainer?.containerId === "agents" && activeSurfaceId === "agents-environment" ? (
            <AgentsEnvironmentSurface />
          ) : null}

          {activeContainer?.containerId === "agents" &&
          activeSurfaceId === "agents-observability" ? (
            <AgentsObservabilitySurface />
          ) : null}

          {activeContainer?.containerId === "integration" &&
          activeSurfaceId === "provider-control" ? (
            <IntegrationControlSurface />
          ) : null}

          {activeContainer?.containerId === "integration" &&
          activeSurfaceId === "integration-observability" ? (
            <IntegrationObservabilitySurface />
          ) : null}

          {activeContainer?.containerId === "coordination" &&
          activeSurfaceId === "change-sessions" ? (
            <ChangeSessionWorkbenchSurface />
          ) : null}

          {activeContainer?.containerId === "coordination" &&
          activeSurfaceId === "coordination-observability" ? (
            <CoordinationObservabilitySurface />
          ) : null}

          {activeContainer?.containerId === "execution-environment" &&
          activeSurfaceId === "environment-lifecycle" ? (
            <ExecutionEnvironmentSurface />
          ) : null}

          {activeContainer?.containerId === "execution-environment" &&
          activeSurfaceId === "bounded-executor" ? (
            <BoundedExecutorSurface />
          ) : null}

          {activeContainer?.containerId === "storage" && activeSurfaceId === "storage-custody" ? (
            <StorageObservabilitySurface />
          ) : null}
        </section>
      </main>
    </div>
  );
}

function FrameworkDiagnosticsSurface(props: { bootstrap: HostBootstrapPayload }) {
  const [diagnostics, setDiagnostics] = useState<FrameworkDiagnostics | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void request<FrameworkDiagnostics>("/framework/diagnostics").then(setDiagnostics);
  }, []);

  async function openRoot(target: string) {
    const message = await openPath(target);
    setNotice(message || `Requested desktop host to open ${target}.`);
  }

  return (
    <div className="grid two-up">
      <Panel title="Platform">
        <Row label="Title" value={props.bootstrap.platform.title} />
        <Row label="Workspace" value={props.bootstrap.platform.workspaceRoot} />
        <Row label="Data Root" value={props.bootstrap.platform.dataRoot} />
        <Row label="Started" value={props.bootstrap.platform.startedAt} />
        <Row label="Desktop Bridge" value={String(props.bootstrap.nativeBridge.desktop)} />
        {props.bootstrap.nativeBridge.openPath ? (
          <div className="action-bar">
            <button onClick={() => void openRoot(props.bootstrap.platform.workspaceRoot)}>
              Open Workspace Root
            </button>
            <button onClick={() => void openRoot(props.bootstrap.platform.dataRoot)}>
              Open Data Root
            </button>
          </div>
        ) : null}
        {notice ? <div className="banner waiting">{notice}</div> : null}
      </Panel>

      <Panel title="Mounted Containers">
        {props.bootstrap.containers.map((container) => (
          <Card key={container.containerId}>
            <strong>{container.label}</strong>
            <p>{container.summary}</p>
            <div className="meta">
              owner {container.ownerId} | surfaces {container.surfaces.length}
            </div>
          </Card>
        ))}
      </Panel>

      <Panel title="Environment Projections">
        {props.bootstrap.environments.map((environment) => (
          <Card key={environment.environmentId}>
            <strong>{environment.label}</strong>
            <p>{environment.summary}</p>
            <div className="meta">
              owner {environment.ownerId} | ready {String(environment.ready)} | {environment.status}
            </div>
          </Card>
        ))}
      </Panel>

      <Panel title="Coordination Events">
        {diagnostics?.coordination.recentEvents.map((event) => (
          <Card key={event.eventId}>
            <strong>{event.summary}</strong>
            <div className="meta">
              {event.ownerId} | {event.type} | {new Date(event.createdAt).toLocaleString()}
            </div>
          </Card>
        )) ?? <p className="muted">Loading coordination signals...</p>}
      </Panel>
    </div>
  );
}

function CapabilityWorkbenchSurface() {
  const [packages, setPackages] = useState<CapabilityPackageSummary[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [detail, setDetail] = useState<CapabilityPackageDetail | null>(null);
  const [notice, setNotice] = useState("");
  const [importReport, setImportReport] = useState<LegacyCapabilityImportReport | null>(null);
  const [actionPayloadText, setActionPayloadText] = useState("{\"value\":\"  sample   text  \"}");
  const [actionResult, setActionResult] = useState<CapabilityActionRunResponse | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    entrypoint: "",
    sourceText: "",
    metadataText: "{}"
  });

  useEffect(() => {
    void loadPackages();
  }, []);

  useEffect(() => {
    if (!packages.length) {
      return;
    }
    if (!selectedPackageId) {
      setSelectedPackageId(packages[0].packageId);
      return;
    }
    void loadDetail(selectedPackageId);
  }, [packages, selectedPackageId]);

  async function loadPackages() {
    const next = await request<CapabilityPackageSummary[]>("/capability-platform/packages");
    setPackages(next);
  }

  async function loadDetail(packageId: string) {
    const next = await request<CapabilityPackageDetail>(`/capability-platform/packages/${packageId}`);
    setDetail(next);
    setDraft({
      name: next.package.draft.name,
      description: next.package.draft.description,
      entrypoint: next.package.draft.entrypoint,
      sourceText: next.package.draft.sourceText,
      metadataText: JSON.stringify(next.package.draft.metadata, null, 2)
    });
  }

  async function saveDraft() {
    const metadata = parseJson(draft.metadataText);
    if (!metadata) {
      setNotice("Metadata must be valid JSON.");
      return;
    }
    const next = await request<CapabilityPackageDetail>(
      `/capability-platform/packages/${selectedPackageId}/draft`,
      {
        method: "PUT",
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          entrypoint: draft.entrypoint,
          sourceText: draft.sourceText,
          metadata
        })
      }
    );
    setDetail(next);
    await loadPackages();
    setNotice("Draft surface updated.");
  }

  async function validatePackage() {
    const result = await request<CapabilityValidationResult>(
      `/capability-platform/packages/${selectedPackageId}/validate`,
      { method: "POST" }
    );
    await loadDetail(selectedPackageId);
    setNotice(result.summary);
  }

  async function publishPackage() {
    const next = await request<CapabilityPackageDetail>(
      `/capability-platform/packages/${selectedPackageId}/publish`,
      { method: "POST" }
    );
    setDetail(next);
    await loadPackages();
    setNotice("Created a local published version. Nothing was uploaded.");
  }

  async function rollbackPackage(releaseId: string) {
    const next = await request<CapabilityPackageDetail>(
      `/capability-platform/packages/${selectedPackageId}/rollback`,
      {
        method: "POST",
        body: JSON.stringify({ releaseId })
      }
    );
    setDetail(next);
    await loadPackages();
    setNotice(`Rolled back published surface to release ${releaseId}.`);
  }

  async function importLegacyPrompts() {
    const report = await request<LegacyCapabilityImportReport>(
      "/capability-platform/import/legacy-prompts",
      { method: "POST" }
    );
    setImportReport(report);
    await loadPackages();
    setNotice(`Imported ${report.importedCount} legacy prompt package(s).`);
  }

  async function runPackageAction() {
    const payload = parseJson(actionPayloadText);
    if (!payload) {
      setNotice("Action payload must be valid JSON.");
      return;
    }
    const response = await fetch(
      `${apiBaseUrl}/capability-platform/packages/${selectedPackageId}/actions/run`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestedByOwnerId: "capability-platform",
          surfaceId: "published",
          payload
        })
      }
    );
    const result = (await response.json()) as CapabilityActionRunResponse;
    setActionResult(result);
    await loadDetail(selectedPackageId);
    setNotice(
      result.executorRun.status === "complete"
        ? "Package action completed through the bounded executor."
        : `Package action ${result.executorRun.status}.`
    );
  }

  return (
    <div className="grid shell-split">
      <Panel title="Package Inventory">
        <div className="action-bar">
          <button onClick={() => void importLegacyPrompts()}>Import Legacy Prompt Packages</button>
        </div>
        {packages.map((pkg) => (
          <button
            key={pkg.packageId}
            className={pkg.packageId === selectedPackageId ? "list-button active" : "list-button"}
            onClick={() => setSelectedPackageId(pkg.packageId)}
          >
            <strong>{pkg.name}</strong>
            <span>{pkg.packageId}</span>
            <span>{pkg.releaseCount} release(s)</span>
          </button>
        ))}
        {importReport ? (
          <div className="banner waiting">
            imported {importReport.importedCount} | skipped {importReport.skippedCount}
          </div>
        ) : null}
      </Panel>

      <div className="stack">
        <Panel title="Draft: inspect and publish">
          <p className="muted">Start with Text Normalizer. Inspect its source, validate it, then publish a local version. The action below runs that published version with your Python interpreter.</p>
          <label>
            <span>Name</span>
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label>
            <span>Description</span>
            <textarea
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </label>
          <label>
            <span>Entrypoint</span>
            <input
              value={draft.entrypoint}
              onChange={(event) => setDraft({ ...draft, entrypoint: event.target.value })}
            />
          </label>
          <label>
            <span>Metadata JSON</span>
            <textarea
              rows={6}
              value={draft.metadataText}
              onChange={(event) => setDraft({ ...draft, metadataText: event.target.value })}
            />
          </label>
          <label>
            <span>Python source</span>
            <textarea
              rows={12}
              value={draft.sourceText}
              onChange={(event) => setDraft({ ...draft, sourceText: event.target.value })}
            />
          </label>
          <div className="action-bar">
            <button onClick={() => void saveDraft()}>Save Draft</button>
            <button onClick={() => void validatePackage()}>Validate</button>
            <button onClick={() => void publishPackage()}>Publish</button>
          </div>
          {detail?.package.draftValidation ? (
            <div className={detail.package.draftValidation.ok ? "banner done" : "banner error"}>
              {detail.package.draftValidation.summary}
            </div>
          ) : null}
          {notice ? <div className="banner waiting">{notice}</div> : null}
        </Panel>

        <div className="grid two-up">
          <Panel title="Published Forms">
            {detail?.publishedRelease ? (
              <>
                <Subsection label={`Published Source (${detail.publishedRelease.sourceLanguage})`}>
                  <pre>{detail.publishedRelease.forms.source}</pre>
                </Subsection>
                <Subsection label="Published JSON">
                  <pre>{detail.publishedRelease.forms.json}</pre>
                </Subsection>
                <Subsection label="Published Text">
                  <pre>{detail.publishedRelease.forms.text}</pre>
                </Subsection>
              </>
            ) : (
              <p className="muted">No published release exists yet.</p>
            )}
          </Panel>

          <Panel title="History / Rollback">
            {detail?.releases.map((release) => (
              <Card key={release.releaseId}>
                <strong>v{release.version}</strong>
                <div className="meta">
                  {new Date(release.publishedAt).toLocaleString()} | entrypoint {release.entrypoint}
                </div>
                <button onClick={() => void rollbackPackage(release.releaseId)}>Rollback To This</button>
              </Card>
            )) ?? <p className="muted">Loading package history...</p>}
          </Panel>
        </div>

        <Panel title="Governed Package Action">
          <label>
            <span>Action Payload JSON</span>
            <textarea
              rows={5}
              value={actionPayloadText}
              onChange={(event) => setActionPayloadText(event.target.value)}
            />
          </label>
          <button disabled={!detail?.publishedRelease} onClick={() => void runPackageAction()}>
            Run Published Action
          </button>
          {actionResult ? (
            <Subsection label={`Executor ${actionResult.executorRun.status}`}>
              <Row label="Executor Run" value={actionResult.executorRun.runId} />
              <Row label="Evidence" value={actionResult.evidence.executionId} />
              <Row label="Authorization" value={actionResult.authorization.summary} />
              {actionResult.executorRun.permissionDenials.map((denial) => (
                <div key={denial} className="banner error">{denial}</div>
              ))}
              {actionResult.executorRun.outputs.map((output) => (
                <Card key={output.outputId}>
                  <strong>{output.label}</strong>
                  <pre>{output.body}</pre>
                </Card>
              ))}
              {actionResult.executorRun.failures.map((failure) => (
                <div key={`${failure.at}-${failure.summary}`} className="banner error">
                  {failure.summary}
                </div>
              ))}
            </Subsection>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}

function CapabilityObservabilitySurface() {
  const [observability, setObservability] = useState<CapabilityPlatformObservability | null>(null);

  useEffect(() => {
    void request<CapabilityPlatformObservability>("/capability-platform/observability").then(
      setObservability
    );
  }, []);

  return (
    <div className="grid two-up">
      <Panel title="Platform Signals">
        <Row label="Storage Root" value={observability?.storageRoot ?? "loading"} />
        <Row label="Packages" value={String(observability?.packageCount ?? 0)} />
        <Row label="Releases" value={String(observability?.releaseCount ?? 0)} />
        <Row label="Published" value={String(observability?.publishedCount ?? 0)} />
        <Row label="Gates" value={String(observability?.gateCount ?? 0)} />
        <Row label="Legacy Imports" value={String(observability?.legacyImportedCount ?? 0)} />
      </Panel>

      <Panel title="Package Contracts">
        {observability?.packages.map((pkg) => (
          <Card key={pkg.packageId}>
            <strong>{pkg.packageId}</strong>
            <p>language: {pkg.sourceLanguage}</p>
            <p>gates: {pkg.gates.join(", ") || "none"}</p>
            <p>contracts: {pkg.surfaceContracts.join(", ") || "none"}</p>
            <div className="meta">published: {pkg.publishedReleaseId ?? "none"}</div>
          </Card>
        )) ?? <p className="muted">Loading capability platform observability...</p>}
      </Panel>
    </div>
  );
}

function CapabilityLifecycleLedgerSurface() {
  const [packages, setPackages] = useState<CapabilityPackageSummary[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [detail, setDetail] = useState<CapabilityPackageDetail | null>(null);

  useEffect(() => {
    void request<CapabilityPackageSummary[]>("/capability-platform/packages").then(setPackages);
  }, []);

  useEffect(() => {
    if (!packages.length) {
      return;
    }
    const packageId = selectedPackageId || packages[0].packageId;
    if (!selectedPackageId) {
      setSelectedPackageId(packageId);
      return;
    }
    void request<CapabilityPackageDetail>(`/capability-platform/packages/${packageId}`).then(setDetail);
  }, [packages, selectedPackageId]);

  return (
    <div className="grid shell-split">
      <Panel title="Packages">
        {packages.map((pkg) => (
          <button
            key={pkg.packageId}
            className={pkg.packageId === selectedPackageId ? "list-button active" : "list-button"}
            onClick={() => setSelectedPackageId(pkg.packageId)}
          >
            <strong>{pkg.name}</strong>
            <span>{pkg.packageId}</span>
            <span>{pkg.releaseCount} release(s)</span>
          </button>
        ))}
      </Panel>
      <div className="stack">
        <Panel title="Drafts And Publications">
          <Row label="Drafts" value={String(detail?.drafts.length ?? 0)} />
          <Row label="Draft Items" value={String(detail?.draftItems.length ?? 0)} />
          <Row label="Candidates" value={String(detail?.publicationCandidates.length ?? 0)} />
          <Row label="Publications" value={String(detail?.publications.length ?? 0)} />
          <Row label="Live Release" value={detail?.liveRecord?.releaseId ?? "none"} />
        </Panel>
        <div className="grid two-up">
          <Panel title="Package Events">
            {detail?.packageEvents.map((event) => (
              <Card key={event.eventId}>
                <strong>{event.summary}</strong>
                <div className="meta">{event.type} | {new Date(event.createdAt).toLocaleString()}</div>
              </Card>
            )) ?? <p className="muted">Select a package to inspect lifecycle events.</p>}
          </Panel>
          <Panel title="Published Forms">
            {detail?.publishedForms.map((form) => (
              <Card key={form.formId}>
                <strong>{form.formKind}</strong>
                <p>{form.mediaType}</p>
                <div className="meta">{form.artifactId}</div>
              </Card>
            )) ?? <p className="muted">No published forms loaded.</p>}
          </Panel>
          <Panel title="Package Runtime Evidence">
            {detail?.packageActionExecutions.map((execution) => (
              <Card key={execution.executionId}>
                <strong>{execution.status}</strong>
                <p>{execution.inputSummary}</p>
                <div className="meta">
                  executor {execution.executorRunId} | outputs {execution.outputCount} | failures{" "}
                  {execution.failureCount}
                </div>
              </Card>
            )) ?? <p className="muted">No package runtime evidence loaded.</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function CapabilityPolicyAdminSurface() {
  const [packages, setPackages] = useState<CapabilityPackageSummary[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [surface, setSurface] = useState<CapabilityPackageSurfaceDetail | null>(null);

  useEffect(() => {
    void request<CapabilityPackageSummary[]>("/capability-platform/packages").then(setPackages);
  }, []);

  useEffect(() => {
    if (!packages.length) {
      return;
    }
    const packageId = selectedPackageId || packages[0].packageId;
    if (!selectedPackageId) {
      setSelectedPackageId(packageId);
      return;
    }
    void request<CapabilityPackageSurfaceDetail>(
      `/capability-platform/packages/${packageId}/surfaces/policy`
    ).then(setSurface);
  }, [packages, selectedPackageId]);

  return (
    <div className="grid two-up">
      <Panel title="Package Selection">
        {packages.map((pkg) => (
          <button
            key={pkg.packageId}
            className={pkg.packageId === selectedPackageId ? "list-button active" : "list-button"}
            onClick={() => setSelectedPackageId(pkg.packageId)}
          >
            <strong>{pkg.name}</strong>
            <span>{pkg.packageId}</span>
          </button>
        ))}
      </Panel>
      <Panel title="Surface Policy">
        {surface?.policy ? (
          <Card>
            <strong>{surface.policy.surfaceId}</strong>
            <p>access: {surface.policy.access}</p>
            <p>consumers: {surface.policy.consumers.join(", ") || "none"}</p>
            <div className="meta">policy {surface.policy.policyId}</div>
          </Card>
        ) : (
          <p className="muted">Select a package to inspect policy surface custody.</p>
        )}
      </Panel>
    </div>
  );
}

function AgentsWorkbenchSurface() {
  const [definitions, setDefinitions] = useState<AgentDefinitionRecord[]>([]);
  const [instances, setInstances] = useState<AgentInstanceRecord[]>([]);
  const [packages, setPackages] = useState<AgentPackageRecord[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState("");
  const [notice, setNotice] = useState("");
  const [importReport, setImportReport] = useState<LegacyAgentsImportReport | null>(null);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!instances.length) {
      return;
    }
    if (!selectedInstanceId) {
      setSelectedInstanceId(instances[0].instanceId);
    }
  }, [instances, selectedInstanceId]);

  async function load() {
    const [nextDefinitions, nextInstances, nextPackages] = await Promise.all([
      request<AgentDefinitionRecord[]>("/agents/definitions"),
      request<AgentInstanceRecord[]>("/agents"),
      request<AgentPackageRecord[]>("/agents/packages")
    ]);
    setDefinitions(nextDefinitions);
    setInstances(nextInstances);
    setPackages(nextPackages);
  }

  async function setState(nextState: "active" | "inactive") {
    await request(`/agents/${selectedInstanceId}/state`, {
      method: "PUT",
      body: JSON.stringify({ state: nextState })
    });
    await load();
    setNotice(`Set ${selectedInstanceId} to ${nextState}.`);
  }

  async function exportInstance() {
    await request(`/agents/${selectedInstanceId}/export`, { method: "POST" });
    await load();
    setNotice(`Exported ${selectedInstanceId} as an agent package.`);
  }

  async function importLegacyAgents() {
    const report = await request<LegacyAgentsImportReport>("/agents/import/legacy", {
      method: "POST"
    });
    setImportReport(report);
    await load();
    setNotice(`Imported ${report.importedDefinitions.length} definition(s) from legacy agents.`);
  }

  const selectedInstance =
    instances.find((instance) => instance.instanceId === selectedInstanceId) ?? instances[0] ?? null;
  const selectedDefinition =
    definitions.find((definition) => definition.definitionId === selectedInstance?.definitionId) ??
    null;

  return (
    <div className="grid shell-split">
      <Panel title="Definitions / Instances">
        <div className="action-bar">
          <button onClick={() => void importLegacyAgents()}>Import Legacy Agents</button>
        </div>
        <div className="section-label">Definitions</div>
        {definitions.map((definition) => (
          <Card key={definition.definitionId}>
            <strong>{definition.label}</strong>
            <p>{definition.remit}</p>
            <div className="meta">{definition.toolManifest.join(", ") || "no tools"}</div>
          </Card>
        ))}
        <div className="section-label">Instances</div>
        {instances.map((instance) => (
          <button
            key={instance.instanceId}
            className={instance.instanceId === selectedInstance?.instanceId ? "list-button active" : "list-button"}
            onClick={() => setSelectedInstanceId(instance.instanceId)}
          >
            <strong>{instance.label}</strong>
            <span>{instance.instanceId}</span>
            <span>{instance.state}</span>
          </button>
        ))}
        {importReport ? (
          <div className="banner waiting">
            imported {importReport.importedDefinitions.length} definitions |{" "}
            {importReport.importedInstances.length} instances
          </div>
        ) : null}
      </Panel>

      <div className="stack">
        <Panel title="Agent Continuity">
          {selectedInstance && selectedDefinition ? (
            <>
              <Row label="Definition" value={selectedDefinition.label} />
              <Row label="Remit" value={selectedDefinition.remit} />
              <Row label="State" value={selectedInstance.state} />
              <Row label="Triggers" value={selectedDefinition.triggers.join(", ") || "none"} />
              <Row
                label="Governance"
                value={selectedDefinition.governanceFlags?.join(", ") || "none"}
              />
              <div className="action-bar">
                <button onClick={() => void setState("active")}>Set Active</button>
                <button onClick={() => void setState("inactive")}>Set Inactive</button>
                <button onClick={() => void exportInstance()}>Export Package</button>
              </div>
              {notice ? <div className="banner waiting">{notice}</div> : null}
            </>
          ) : (
            <p className="muted">No agent instance selected.</p>
          )}
        </Panel>

        <div className="grid two-up">
          <Panel title="Memory">
            {selectedInstance?.memory.map((region) => (
              <Card key={region.regionId}>
                <strong>{region.name}</strong>
                <pre>{region.content}</pre>
              </Card>
            )) ?? <p className="muted">No memory regions loaded.</p>}
          </Panel>

          <Panel title="Agent Packages">
            {packages.map((pkg) => (
              <Card key={pkg.packageId}>
                <strong>{pkg.label}</strong>
                <div className="meta">
                  {pkg.toolManifest.join(", ") || "no tools"} | {new Date(pkg.exportedAt).toLocaleString()}
                </div>
              </Card>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function AgentsObservabilitySurface() {
  const [observability, setObservability] = useState<AgentsObservability | null>(null);

  useEffect(() => {
    void request<AgentsObservability>("/agents/observability").then(setObservability);
  }, []);

  return (
    <div className="grid two-up">
      <Panel title="Agents Posture">
        <Row label="Storage Root" value={observability?.storageRoot ?? "loading"} />
        <Row label="Definitions" value={String(observability?.definitionCount ?? 0)} />
        <Row label="Instances" value={String(observability?.instanceCount ?? 0)} />
        <Row label="Packages" value={String(observability?.packageCount ?? 0)} />
        <Row label="Active" value={String(observability?.activeCount ?? 0)} />
        <Row label="Inactive" value={String(observability?.inactiveCount ?? 0)} />
        <Row label="Legacy Imports" value={String(observability?.importedLegacyCount ?? 0)} />
        <Row label="Specs" value={String(observability?.specCount ?? 0)} />
        <Row label="Sections" value={String(observability?.sectionCount ?? 0)} />
        <Row label="Capability Grants" value={String(observability?.capabilityAssignmentCount ?? 0)} />
        <Row label="File Assignments" value={String(observability?.fileAssignmentCount ?? 0)} />
        <Row label="Tool File Permissions" value={String(observability?.toolFilePermissionCount ?? 0)} />
        <Row label="Workflows" value={String(observability?.workflowCount ?? 0)} />
        <Row label="Workflow Runs" value={String(observability?.workflowRunCount ?? 0)} />
      </Panel>
    </div>
  );
}

function AgentsPermissionsSurface() {
  const [instances, setInstances] = useState<AgentInstanceRecord[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState("");
  const [files, setFiles] = useState<AgentFileAssignmentRecord[]>([]);
  const [permissions, setPermissions] = useState<AgentToolFilePermissionRecord[]>([]);
  const [notice, setNotice] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [toolInput, setToolInput] = useState("filesystem.read");

  useEffect(() => {
    void request<AgentInstanceRecord[]>("/agents").then(setInstances);
  }, []);

  useEffect(() => {
    if (!instances.length) {
      return;
    }
    const instanceId = selectedInstanceId || instances[0].instanceId;
    if (!selectedInstanceId) {
      setSelectedInstanceId(instanceId);
      return;
    }
    void loadPermissions(instanceId);
  }, [instances, selectedInstanceId]);

  async function loadPermissions(instanceId: string) {
    const [nextFiles, nextPermissions] = await Promise.all([
      request<AgentFileAssignmentRecord[]>(`/agents/${instanceId}/files`),
      request<AgentToolFilePermissionRecord[]>(`/agents/${instanceId}/tool-file-permissions`)
    ]);
    setFiles(nextFiles);
    setPermissions(nextPermissions);
  }

  async function assignFile() {
    await request(`/agents/${selectedInstanceId}/files`, {
      method: "POST",
      body: JSON.stringify({ path: pathInput, globalToolEligible: false })
    });
    await loadPermissions(selectedInstanceId);
    setNotice("Assigned file visibility to the agent keycard.");
  }

  async function grantToolPermission() {
    await request(`/agents/${selectedInstanceId}/tool-file-permissions`, {
      method: "POST",
      body: JSON.stringify({ toolId: toolInput, path: pathInput, access: "read" })
    });
    await loadPermissions(selectedInstanceId);
    setNotice("Granted per-tool read permission for the selected path.");
  }

  return (
    <div className="grid shell-split">
      <Panel title="Agent">
        {instances.map((instance) => (
          <button
            key={instance.instanceId}
            className={instance.instanceId === selectedInstanceId ? "list-button active" : "list-button"}
            onClick={() => setSelectedInstanceId(instance.instanceId)}
          >
            <strong>{instance.label}</strong>
            <span>{instance.state}</span>
          </button>
        ))}
      </Panel>
      <div className="stack">
        <Panel title="Keycard And Tool Permission">
          <label>
            <span>Path</span>
            <input value={pathInput} onChange={(event) => setPathInput(event.target.value)} />
          </label>
          <label>
            <span>Tool</span>
            <input value={toolInput} onChange={(event) => setToolInput(event.target.value)} />
          </label>
          <div className="action-bar">
            <button disabled={!pathInput.trim()} onClick={() => void assignFile()}>Assign Visibility</button>
            <button disabled={!pathInput.trim()} onClick={() => void grantToolPermission()}>Grant Tool Read</button>
          </div>
          {notice ? <div className="banner waiting">{notice}</div> : null}
        </Panel>
        <div className="grid two-up">
          <Panel title="Visible Files">
            {files.map((file) => (
              <Card key={file.assignmentId}>
                <strong>{file.path}</strong>
                <div className="meta">{file.kind} | global eligible {String(file.globalToolEligible)}</div>
              </Card>
            ))}
          </Panel>
          <Panel title="Per-Tool Permissions">
            {permissions.map((permission) => (
              <Card key={permission.permissionId}>
                <strong>{permission.toolId}</strong>
                <p>{permission.path}</p>
                <div className="meta">{permission.access} | {permission.scope}</div>
              </Card>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function AgentsWorkflowsSurface() {
  const [instances, setInstances] = useState<AgentInstanceRecord[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState("");
  const [workflows, setWorkflows] = useState<AgentWorkflowRecord[]>([]);
  const [runs, setRuns] = useState<AgentWorkflowRunRecord[]>([]);
  const [preview, setPreview] = useState<AgentWorkflowTargetPreview | null>(null);
  const [run, setRun] = useState<AgentWorkflowRunRecord | null>(null);
  const [label, setLabel] = useState("Manual Review");
  const [instruction, setInstruction] = useState("");
  const [toolIdsText, setToolIdsText] = useState("");
  const [packageIdsText, setPackageIdsText] = useState("");

  useEffect(() => {
    void request<AgentInstanceRecord[]>("/agents").then(setInstances);
  }, []);

  useEffect(() => {
    if (!instances.length) {
      return;
    }
    const instanceId = selectedInstanceId || instances[0].instanceId;
    if (!selectedInstanceId) {
      setSelectedInstanceId(instanceId);
      return;
    }
    void loadWorkflows(instanceId);
  }, [instances, selectedInstanceId]);

  async function loadWorkflows(instanceId: string) {
    const [nextWorkflows, nextRuns] = await Promise.all([
      request<AgentWorkflowRecord[]>(`/agents/${instanceId}/workflows`),
      request<AgentWorkflowRunRecord[]>(`/agents/${instanceId}/workflow-runs`)
    ]);
    setWorkflows(nextWorkflows);
    setRuns(nextRuns);
  }

  async function saveWorkflow() {
    await request<AgentWorkflowRecord>(`/agents/${selectedInstanceId}/workflows`, {
      method: "POST",
      body: JSON.stringify({
        label,
        instruction,
        toolIds: splitList(toolIdsText),
        packageIds: splitList(packageIdsText)
      })
    });
    await loadWorkflows(selectedInstanceId);
  }

  async function previewWorkflow(workflowId: string) {
    setPreview(
      await request<AgentWorkflowTargetPreview>(
        `/agents/${selectedInstanceId}/workflows/${workflowId}/target-preview`
      )
    );
  }

  async function requestRun(workflowId: string) {
    const response = await fetch(`${apiBaseUrl}/agents/${selectedInstanceId}/workflows/${workflowId}/run`, {
      method: "POST"
    });
    setRun((await response.json()) as AgentWorkflowRunRecord);
    await loadWorkflows(selectedInstanceId);
  }

  return (
    <div className="grid shell-split">
      <Panel title="Agent">
        {instances.map((instance) => (
          <button
            key={instance.instanceId}
            className={instance.instanceId === selectedInstanceId ? "list-button active" : "list-button"}
            onClick={() => setSelectedInstanceId(instance.instanceId)}
          >
            <strong>{instance.label}</strong>
            <span>{instance.state}</span>
          </button>
        ))}
      </Panel>
      <div className="stack">
        <Panel title="Workflow Entry">
          <label>
            <span>Label</span>
            <input value={label} onChange={(event) => setLabel(event.target.value)} />
          </label>
          <label>
            <span>Instruction</span>
            <textarea rows={5} value={instruction} onChange={(event) => setInstruction(event.target.value)} />
          </label>
          <label>
            <span>Tool IDs</span>
            <input value={toolIdsText} onChange={(event) => setToolIdsText(event.target.value)} />
          </label>
          <label>
            <span>Package IDs</span>
            <input value={packageIdsText} onChange={(event) => setPackageIdsText(event.target.value)} />
          </label>
          <button onClick={() => void saveWorkflow()}>Save Workflow</button>
        </Panel>
        <Panel title="Workflows">
          {workflows.map((workflow) => (
            <Card key={workflow.workflowId}>
              <strong>{workflow.label}</strong>
              <p>{workflow.instruction}</p>
              <div className="action-bar">
                <button onClick={() => void previewWorkflow(workflow.workflowId)}>Preview Targets</button>
                <button onClick={() => void requestRun(workflow.workflowId)}>Request Run</button>
              </div>
              <div className="meta">
                tools {(workflow.toolIds ?? []).join(", ") || "definition manifest"} | packages{" "}
                {(workflow.packageIds ?? []).join(", ") || "none"}
              </div>
            </Card>
          ))}
        </Panel>
        <div className="grid two-up">
          <Panel title="Target Preview">
            {preview?.targets.map((target) => (
              <Card key={target.path}>
                <strong>{target.path}</strong>
                <p>{target.reason}</p>
                <div className="meta">permitted {String(target.permitted)}</div>
              </Card>
            )) ?? <p className="muted">No target preview requested.</p>}
          </Panel>
          <Panel title="Run Boundary">
            {run ? (
              <Card>
                <strong>{run.status}</strong>
                <p>{run.summary}</p>
                <div className="meta">
                  run {run.runId} | executor {run.executorRunId ?? "none"}
                </div>
                {run.permissionDenials.map((denial) => (
                  <div key={denial} className="banner error">{denial}</div>
                ))}
                {run.outputs.map((output) => (
                  <pre key={output.outputId}>{output.body}</pre>
                ))}
              </Card>
            ) : (
              <p className="muted">Run requests pass runtime permission checks before executor handoff.</p>
            )}
          </Panel>
        </div>
        <Panel title="Run Evidence">
          {runs.map((item) => (
            <Card key={item.runId}>
              <strong>{item.status}</strong>
              <p>{item.summary}</p>
              <div className="meta">
                workflow {item.workflowId} | outputs {item.outputs.length} | denials{" "}
                {item.permissionDenials.length}
              </div>
            </Card>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function AgentsEnvironmentSurface() {
  const [instances, setInstances] = useState<AgentInstanceRecord[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState("");
  const [context, setContext] = useState<AgentEnvironmentContext | null>(null);

  useEffect(() => {
    void request<AgentInstanceRecord[]>("/agents").then(setInstances);
  }, []);

  useEffect(() => {
    if (!instances.length) {
      return;
    }
    const instanceId = selectedInstanceId || instances[0].instanceId;
    if (!selectedInstanceId) {
      setSelectedInstanceId(instanceId);
      return;
    }
    void request<AgentEnvironmentContext>(`/agents/${instanceId}/environment-context`).then(setContext);
  }, [instances, selectedInstanceId]);

  return (
    <div className="grid shell-split">
      <Panel title="Hall">
        {instances.map((instance) => (
          <button
            key={instance.instanceId}
            className={instance.instanceId === selectedInstanceId ? "list-button active" : "list-button"}
            onClick={() => setSelectedInstanceId(instance.instanceId)}
          >
            <strong>{instance.label}</strong>
            <span>{instance.instanceId}</span>
          </button>
        ))}
      </Panel>
      <div className="stack">
        <Panel title="Bay Readiness">
          <Row label="Environment" value={context?.environmentId ?? "loading"} />
          <Row label="Hall Ready" value={String(context?.hallReady ?? false)} />
          <Row label="Bay Ready" value={String(context?.bayReady ?? false)} />
          <Row label="Appearance Accent" value={context?.appearance?.accent ?? "default"} />
        </Panel>
        <Panel title="Sections">
          {context?.sections.map((section: AgentSectionRecord) => (
            <Card key={section.sectionId}>
              <strong>{section.label}</strong>
              <pre>{JSON.stringify(section.body, null, 2)}</pre>
            </Card>
          )) ?? <p className="muted">No agent bay context loaded.</p>}
        </Panel>
      </div>
    </div>
  );
}

function IntegrationControlSurface() {
  const [providers, setProviders] = useState<ProviderStatusRecord[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [notice, setNotice] = useState("");
  const [importReport, setImportReport] = useState<LegacyIntegrationImportReport | null>(null);

  useEffect(() => {
    void loadProviders();
  }, []);

  async function loadProviders() {
    setProviders(await request<ProviderStatusRecord[]>("/integration/providers"));
  }

  async function saveCredential() {
    await request("/integration/providers/openai/credentials", {
      method: "PUT",
      body: JSON.stringify({ apiKey })
    });
    setApiKey("");
    await loadProviders();
    setNotice("Stored OpenAI credential under the Integration owner.");
  }

  async function clearCredential() {
    await request("/integration/providers/openai/credentials", {
      method: "DELETE"
    });
    await loadProviders();
    setNotice("Cleared stored OpenAI credential.");
  }

  async function setMode(mode: "online" | "offline") {
    await request("/integration/mode", {
      method: "PUT",
      body: JSON.stringify({ mode })
    });
    await loadProviders();
    setNotice(`Set integration mode to ${mode}.`);
  }

  async function importLegacyInventory() {
    const report = await request<LegacyIntegrationImportReport>(
      "/integration/import/legacy-provider-inventory",
      { method: "POST" }
    );
    setImportReport(report);
    await loadProviders();
    setNotice(`Imported ${report.importedProviderConfigs.length} provider config(s) from legacy roots.`);
  }

  const provider = providers[0];

  return (
    <div className="grid two-up">
      <Panel title="External Crossing Control">
        <Row label="Provider" value={provider?.providerLabel ?? "OpenAI"} />
        <Row label="Mode" value={provider?.mode ?? "offline"} />
        <Row label="Configured" value={String(provider?.configured ?? false)} />
        <Row label="Available" value={String(provider?.available ?? false)} />
        <label>
          <span>OpenAI API Key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Paste API key for live external crossing"
          />
        </label>
        <div className="action-bar">
          <button onClick={() => void saveCredential()} disabled={!apiKey.trim()}>
            Save Credential
          </button>
          <button onClick={() => void setMode("online")}>Go Online</button>
          <button onClick={() => void setMode("offline")}>Stay Offline</button>
          <button onClick={() => void clearCredential()}>Clear Credential</button>
          <button onClick={() => void importLegacyInventory()}>Import Legacy Inventory</button>
        </div>
        {notice ? <div className="banner waiting">{notice}</div> : null}
        {importReport ? (
          <div className="banner waiting">
            imported configs {importReport.importedProviderConfigs.length} | catalogs{" "}
            {importReport.importedCatalogs.length}
          </div>
        ) : null}
      </Panel>

      <Panel title="Current Provider Status">
        {providers.map((item) => (
          <Card key={item.providerKey}>
            <strong>{item.providerLabel}</strong>
            <p>{item.message}</p>
            <div className="meta">
              mode {item.mode} | source {item.credentialSource} | checked{" "}
              {new Date(item.checkedAt).toLocaleString()}
            </div>
          </Card>
        ))}
      </Panel>
    </div>
  );
}

function IntegrationObservabilitySurface() {
  const [observability, setObservability] = useState<IntegrationObservability | null>(null);

  useEffect(() => {
    void request<IntegrationObservability>("/integration/observability").then(setObservability);
  }, []);

  return (
    <div className="grid two-up">
      <Panel title="Integration Posture">
        <Row label="Storage Root" value={observability?.storageRoot ?? "loading"} />
        <Row label="Mode" value={observability?.mode ?? "offline"} />
        <Row label="Catalog Providers" value={String(observability?.catalogProviderCount ?? 0)} />
        <Row label="Catalog Models" value={String(observability?.catalogModelCount ?? 0)} />
      </Panel>

      <Panel title="Provider Visibility">
        {observability?.providers.map((provider) => (
          <Card key={provider.providerKey}>
            <strong>{provider.providerLabel}</strong>
            <p>{provider.message}</p>
            <div className="meta">
              configured {String(provider.configured)} | available {String(provider.available)}
            </div>
          </Card>
        )) ?? <p className="muted">Loading integration observability...</p>}
        {observability?.catalogs.map((catalog) => (
          <Card key={`catalog-${catalog.providerKey}`}>
            <strong>{catalog.providerLabel} Catalog</strong>
            <div className="meta">
              models {catalog.modelCount} | imported{" "}
              {new Date(catalog.importedAt).toLocaleString()}
            </div>
          </Card>
        ))}
      </Panel>
    </div>
  );
}

function ChangeSessionWorkbenchSurface() {
  const [workflows, setWorkflows] = useState<WorkflowDefinitionRecord[]>([]);
  const [sessions, setSessions] = useState<ChangeSessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [detail, setDetail] = useState<ChangeSessionDetail | null>(null);
  const [notice, setNotice] = useState("");
  const [importReport, setImportReport] = useState<LegacyCoordinationImportReport | null>(null);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!sessions.length) {
      return;
    }
    const selected = sessions.find((session) => session.sessionId === selectedSessionId) ?? sessions[0];
    if (selected.sessionId !== selectedSessionId) {
      setSelectedSessionId(selected.sessionId);
      return;
    }
    void loadDetail(selected.sessionId);
  }, [sessions, selectedSessionId]);

  async function load() {
    const [nextWorkflows, nextSessions] = await Promise.all([
      request<WorkflowDefinitionRecord[]>("/coordination/workflows"),
      request<ChangeSessionSummary[]>("/coordination/change-sessions")
    ]);
    setWorkflows(nextWorkflows);
    setSessions(nextSessions);
  }

  async function loadDetail(sessionId: string) {
    setDetail(await request<ChangeSessionDetail>(`/coordination/change-sessions/${sessionId}`));
  }

  async function importLegacyChangeWorkflows() {
    const report = await request<LegacyCoordinationImportReport>(
      "/coordination/import/legacy-change-workflows",
      { method: "POST" }
    );
    setImportReport(report);
    await load();
    setNotice(`Imported ${report.importedSessions.length} governed change session(s).`);
  }

  return (
    <div className="grid shell-split">
      <Panel title="Change Sessions">
        <div className="action-bar">
          <button onClick={() => void importLegacyChangeWorkflows()}>
            Import Legacy Change Sessions
          </button>
        </div>
        {sessions.map((session) => (
          <button
            key={session.sessionId}
            className={session.sessionId === selectedSessionId ? "list-button active" : "list-button"}
            onClick={() => setSelectedSessionId(session.sessionId)}
          >
            <strong>{session.title}</strong>
            <span>{session.sessionId}</span>
            <span>
              {session.currentPhase} / {session.currentStatus}
            </span>
          </button>
        ))}
        {importReport ? (
          <div className="banner waiting">
            workflows {importReport.importedWorkflows.length} | sessions {importReport.importedSessions.length}
          </div>
        ) : null}
      </Panel>

      <div className="stack">
        <Panel title="Governed Session Detail">
          {detail ? (
            <>
              <Row label="Workflow" value={detail.workflowLabel} />
              <Row label="Phase" value={detail.currentPhase} />
              <Row label="Status" value={detail.currentStatus} />
              <Row label="Repo" value={detail.repoTarget} />
              <Row label="Events" value={String(detail.eventCount)} />
              <Row label="Invocations" value={String(detail.invocationCount)} />
              <Row label="Audit" value={detail.auditStatus} />
              <Subsection label="Intent Summary">
                <p>{detail.intentSummary || "No intent summary retained."}</p>
              </Subsection>
              <Subsection label="Constraints">
                {detail.constraints.length ? (
                  detail.constraints.map((constraint) => <p key={constraint}>{constraint}</p>)
                ) : (
                  <p className="muted">No explicit constraints recorded.</p>
                )}
              </Subsection>
              <Subsection label="Changed Files">
                {detail.changedFiles.length ? (
                  detail.changedFiles.map((file) => <p key={file}>{file}</p>)
                ) : (
                  <p className="muted">No changed files recorded.</p>
                )}
              </Subsection>
              <Subsection label="Validation Outputs">
                {detail.validationOutputs.length ? (
                  detail.validationOutputs.map((line) => <p key={line}>{line}</p>)
                ) : (
                  <p className="muted">No validation outputs recorded.</p>
                )}
              </Subsection>
              <Subsection label="Next Step">
                <p>{detail.recommendedNextStep || "No next-step guidance retained."}</p>
              </Subsection>
              {notice ? <div className="banner waiting">{notice}</div> : null}
            </>
          ) : (
            <p className="muted">Select a governed change session to inspect its retained workflow truth.</p>
          )}
        </Panel>

        <Panel title="Workflow Definitions">
          {workflows.map((workflow) => (
            <Card key={workflow.workflowId}>
              <strong>{workflow.label}</strong>
              <p>
                {workflow.workflowId} | {workflow.stepCount} step(s) | {workflow.executionPolicy}
              </p>
              <div className="meta">
                {workflow.steps.map((step) => `${step.stepId}:${step.dispatchMode}`).join(" | ")}
              </div>
            </Card>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function CoordinationObservabilitySurface() {
  const [observability, setObservability] = useState<CoordinationObservability | null>(null);

  useEffect(() => {
    void request<CoordinationObservability>("/coordination/observability").then(setObservability);
  }, []);

  return (
    <div className="grid two-up">
      <Panel title="Coordination Signals">
        <Row label="Storage Root" value={observability?.storageRoot ?? "loading"} />
        <Row label="Recent Events" value={String(observability?.eventCount ?? 0)} />
        <Row label="Workflows" value={String(observability?.workflowCount ?? 0)} />
        <Row label="Sessions" value={String(observability?.sessionCount ?? 0)} />
        <Subsection label="Owner Counts">
          {observability?.ownerCounts.map((entry) => (
            <Row key={entry.ownerId} label={entry.ownerId} value={String(entry.count)} />
          )) ?? <p className="muted">Loading owner counts...</p>}
        </Subsection>
      </Panel>

      <Panel title="Type Counts / Recent Events">
        <Subsection label="Event Types">
          {observability?.typeCounts.map((entry) => (
            <Row key={entry.type} label={entry.type} value={String(entry.count)} />
          )) ?? <p className="muted">Loading type counts...</p>}
        </Subsection>
        <Subsection label="Recent Events">
          {observability?.recentEvents.map((event) => (
            <Card key={event.eventId}>
              <strong>{event.summary}</strong>
              <div className="meta">
                {event.ownerId} | {event.type} | {new Date(event.createdAt).toLocaleString()}
              </div>
            </Card>
          )) ?? <p className="muted">Loading recent handoffs...</p>}
        </Subsection>
      </Panel>
    </div>
  );
}

function ExecutionEnvironmentSurface() {
  const [observability, setObservability] = useState<ExecutionEnvironmentObservability | null>(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState("");
  const [summaryDraft, setSummaryDraft] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const selected =
      observability?.environments.find((environment) => environment.environmentId === selectedEnvironmentId) ??
      observability?.environments[0] ??
      null;
    if (selected) {
      if (selected.environmentId !== selectedEnvironmentId) {
        setSelectedEnvironmentId(selected.environmentId);
      }
      setSummaryDraft(selected.summary);
    }
  }, [observability, selectedEnvironmentId]);

  async function load() {
    const next = await request<ExecutionEnvironmentObservability>("/execution-environment/observability");
    setObservability(next);
  }

  async function setState(status: "pending" | "ready" | "degraded") {
    if (!selectedEnvironmentId) {
      return;
    }
    const next = await request<ExecutionEnvironmentObservability>(
      `/execution-environment/environments/${selectedEnvironmentId}/state`,
      {
        method: "PUT",
        body: JSON.stringify({
          status,
          ready: status === "ready",
          summary: summaryDraft
        })
      }
    );
    setObservability(next);
    setNotice(`Set ${selectedEnvironmentId} to ${status}.`);
  }

  const selected =
    observability?.environments.find((environment) => environment.environmentId === selectedEnvironmentId) ??
    observability?.environments[0] ??
    null;

  return (
    <div className="grid shell-split">
      <Panel title="Environment Registry">
        <Row label="Storage Root" value={observability?.storageRoot ?? "loading"} />
        <Row label="Registered" value={String(observability?.environmentCount ?? 0)} />
        <Row label="Ready" value={String(observability?.readyCount ?? 0)} />
        <Row label="Degraded" value={String(observability?.degradedCount ?? 0)} />
        <Row label="Pending" value={String(observability?.pendingCount ?? 0)} />
        <Row label="Stations" value={String(observability?.stationCount ?? 0)} />
        <Row label="Rules" value={String(observability?.ruleCount ?? 0)} />
        <Row label="Skins" value={String(observability?.skinCount ?? 0)} />
        <Row label="Executor Runs" value={String(observability?.executor.runCount ?? 0)} />
        <Row label="Executor Denials" value={String(observability?.executor.deniedCount ?? 0)} />
        {observability?.environments.map((environment) => (
          <button
            key={environment.environmentId}
            className={
              environment.environmentId === selected?.environmentId
                ? "list-button active"
                : "list-button"
            }
            onClick={() => {
              setSelectedEnvironmentId(environment.environmentId);
              setSummaryDraft(environment.summary);
            }}
          >
            <strong>{environment.label}</strong>
            <span>{environment.environmentId}</span>
            <span>{environment.status}</span>
          </button>
        )) ?? <p className="muted">Loading environments...</p>}
      </Panel>

      <Panel title="Lifecycle Control">
        {selected ? (
          <>
            <Row label="Environment" value={selected.label} />
            <Row label="Owner" value={selected.ownerId} />
            <Row label="Ready" value={String(selected.ready)} />
            <Row label="Lifecycle" value={selected.lifecycle} />
            <Row label="Readiness Checks" value={selected.readinessChecks.join(", ") || "none"} />
            <Subsection label="Stations">
              {selected.stations.map((station) => (
                <Card key={station.stationId}>
                  <strong>{station.label}</strong>
                  <p>{station.purpose}</p>
                  <div className="meta">{station.actionIds.join(", ") || "no actions"}</div>
                </Card>
              ))}
            </Subsection>
            <Subsection label="Rules">
              {selected.rules.map((rule) => (
                <Card key={rule.ruleId}>
                  <strong>{rule.ruleId}</strong>
                  <p>{rule.summary}</p>
                  <div className="meta">{rule.enforcement}</div>
                </Card>
              ))}
            </Subsection>
            <label>
              <span>Summary</span>
              <textarea
                rows={5}
                value={summaryDraft}
                onChange={(event) => setSummaryDraft(event.target.value)}
              />
            </label>
            <div className="action-bar">
              <button onClick={() => void setState("pending")}>Set Pending</button>
              <button onClick={() => void setState("ready")}>Set Ready</button>
              <button onClick={() => void setState("degraded")}>Set Degraded</button>
            </div>
            {notice ? <div className="banner waiting">{notice}</div> : null}
          </>
        ) : (
          <p className="muted">No environment registered yet.</p>
        )}
      </Panel>
    </div>
  );
}

function BoundedExecutorSurface() {
  const [runs, setRuns] = useState<BoundedExecutorRunRecord[]>([]);

  useEffect(() => {
    void request<BoundedExecutorRunRecord[]>("/execution-environment/executor/runs").then(setRuns);
  }, []);

  return (
    <div className="grid two-up">
      <Panel title="Runtime Evidence">
        {runs.map((run) => (
          <Card key={run.runId}>
            <strong>{run.status}</strong>
            <p>{run.actionKind} | {run.actionId}</p>
            <div className="meta">
              requester {run.requestedByOwnerId} | outputs {run.outputs.length} | failures{" "}
              {run.failures.length}
            </div>
          </Card>
        ))}
      </Panel>
      <Panel title="Permission Denials / Outputs">
        {runs.slice(0, 10).map((run) => (
          <Card key={`detail-${run.runId}`}>
            <strong>{run.runId}</strong>
            {run.permissionDenials.map((denial) => (
              <div key={denial} className="banner error">{denial}</div>
            ))}
            {run.outputs.map((output) => (
              <Subsection key={output.outputId} label={output.label}>
                <pre>{output.body}</pre>
              </Subsection>
            ))}
            {run.failures.map((failure) => (
              <div key={`${failure.at}-${failure.summary}`} className="banner error">
                {failure.summary}
              </div>
            ))}
          </Card>
        ))}
      </Panel>
    </div>
  );
}

function StorageObservabilitySurface() {
  const [observability, setObservability] = useState<StorageObservability | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void request<StorageObservability>("/storage/observability").then(setObservability);
  }, []);

  async function openNamespace(target: string) {
    const message = await openPath(target);
    setNotice(message || `Requested desktop host to open ${target}.`);
  }

  return (
    <div className="grid two-up">
      <Panel title="Custody Summary">
        <Row label="Root" value={observability?.rootPath ?? "loading"} />
        <Row label="Namespaces" value={String(observability?.namespaceCount ?? 0)} />
        <Row label="Records" value={String(observability?.recordCount ?? 0)} />
        <Row label="Events" value={String(observability?.eventCount ?? 0)} />
        <Row label="Artifacts" value={String(observability?.artifactCount ?? 0)} />
        <Row label="Migrations" value={String(observability?.migrationCount ?? 0)} />
        {observability?.rootPath && window.skeletonDesktop ? (
          <div className="action-bar">
            <button onClick={() => void openNamespace(observability.rootPath)}>
              Open Storage Root
            </button>
          </div>
        ) : null}
        {notice ? <div className="banner waiting">{notice}</div> : null}
      </Panel>

      <Panel title="Owner Namespaces">
        {observability?.namespaces.map((namespace) => (
          <Card key={namespace.ownerId}>
            <strong>{namespace.ownerId}</strong>
            <p>
              collections {namespace.collectionCount} | records {namespace.recordCount} | events{" "}
              {namespace.eventCount} | artifacts {namespace.artifactCount} | migrations{" "}
              {namespace.migrationCount}
            </p>
            <div className="action-bar">
              {window.skeletonDesktop ? (
                <button onClick={() => void openNamespace(namespace.rootPath)}>Open Namespace</button>
              ) : null}
            </div>
            <div className="meta">
              {namespace.collections
                .map((collection) => `${collection.collectionId}:${collection.recordCount}`)
                .join(" | ") || "no collections"}
            </div>
          </Card>
        )) ?? <p className="muted">Loading storage observability...</p>}
      </Panel>
    </div>
  );
}

function Panel(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>{props.title}</h3>
      </div>
      {props.children}
    </section>
  );
}

function Card(props: { children: React.ReactNode }) {
  return <article className="card">{props.children}</article>;
}

function Row(props: { label: string; value: string }) {
  return (
    <div className="row">
      <strong>{props.label}</strong>
      <span>{props.value}</span>
    </div>
  );
}

function Subsection(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="subsection">
      <div className="section-label">{props.label}</div>
      {props.children}
    </div>
  );
}

async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({ error: response.statusText }))) as {
      error?: string;
    };
    throw new Error(error.error ?? "Request failed.");
  }
  return (await response.json()) as T;
}

async function openPath(target: string): Promise<string> {
  if (!window.skeletonDesktop?.openPath) {
    return "Desktop bridge is not available in browser mode.";
  }
  const result = await window.skeletonDesktop.openPath(target);
  return result || "";
}

function parseJson(input: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(input) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function splitList(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
