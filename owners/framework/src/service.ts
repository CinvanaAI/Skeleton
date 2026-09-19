import type {
  FrameworkDiagnostics,
  HostBootstrapPayload,
  HostContainerDescriptor,
  HostEnvironmentProjection,
  HostPlatformInfo,
  NativeBridgeProjection
} from "./contracts.js";

export class FrameworkHostRuntime {
  private readonly containers = new Map<string, HostContainerDescriptor>();

  constructor(private readonly platformInfo: HostPlatformInfo) {}

  registerContainer(container: HostContainerDescriptor): void {
    this.containers.set(container.containerId, container);
  }

  listContainers(): HostContainerDescriptor[] {
    return Array.from(this.containers.values()).sort((left, right) =>
      left.label.localeCompare(right.label)
    );
  }

  createBootstrap(input: {
    environments: HostEnvironmentProjection[];
    nativeBridge: NativeBridgeProjection;
  }): HostBootstrapPayload {
    return {
      platform: this.platformInfo,
      containers: this.listContainers(),
      environments: input.environments,
      nativeBridge: input.nativeBridge
    };
  }

  createDiagnostics(input: {
    environments: HostEnvironmentProjection[];
    coordination: FrameworkDiagnostics["coordination"];
  }): FrameworkDiagnostics {
    return {
      platform: this.platformInfo,
      containers: this.listContainers(),
      environments: input.environments,
      coordination: input.coordination
    };
  }
}
