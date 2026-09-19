import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CoordinationLayerService } from "../../coordination/src/service.js";
import type { StorageSubstrateService } from "../../storage/src/service.js";
import type {
  IntegrationMode,
  IntegrationObservability,
  LegacyIntegrationImportReport,
  ProviderCatalogRecord,
  ProviderConfigRecord,
  ProviderStatusRecord
} from "./records.js";

const OWNER_ID = "integration";
const PROVIDER_COLLECTION = "providers";
const CATALOG_COLLECTION = "provider-catalogs";

interface LegacyProviderConfig {
  providerKey: string;
  mode?: "online" | "offline";
  apiKey?: string;
  baseUrl?: string;
}

export class IntegrationLayerService {
  constructor(
    private readonly storage: StorageSubstrateService,
    private readonly coordination: CoordinationLayerService
  ) {}

  async initialize(): Promise<void> {
    const providers = await this.storage.listRecords<ProviderConfigRecord>(OWNER_ID, PROVIDER_COLLECTION);
    if (providers.length === 0) {
      const now = new Date().toISOString();
      await this.storage.putRecord(OWNER_ID, PROVIDER_COLLECTION, "openai", {
        providerKey: "openai",
        providerLabel: "OpenAI",
        mode: "offline",
        credentialStored: false,
        updatedAt: now
      });
    }
  }

  async listProviderStatus(): Promise<ProviderStatusRecord[]> {
    const providers = await this.storage.listRecords<ProviderConfigRecord>(OWNER_ID, PROVIDER_COLLECTION);
    return providers.map((provider) => ({
      providerKey: provider.providerKey,
      providerLabel: provider.providerLabel,
      mode: provider.mode,
      configured: provider.credentialStored,
      available: provider.mode === "online" && provider.credentialStored,
      credentialSource: provider.credentialStored ? "stored-config" : "missing",
      checkedAt: new Date().toISOString(),
      message:
        provider.mode === "online"
          ? provider.credentialStored
            ? "Provider is configured for live external crossing."
            : "Online mode requested but no stored credential is available."
          : "Provider is held in offline mode; external crossing is disabled."
    }));
  }

  async saveOpenAiCredential(input: {
    apiKey: string;
    baseUrl?: string;
  }): Promise<ProviderStatusRecord[]> {
    const current = await this.requireProvider("openai");
    await this.storage.putRecord(OWNER_ID, PROVIDER_COLLECTION, "openai", {
      ...current,
      credentialStored: true,
      apiKey: input.apiKey.trim(),
      ...(input.baseUrl?.trim() ? { baseUrl: input.baseUrl.trim() } : {}),
      updatedAt: new Date().toISOString()
    });
    await this.coordination.recordEvent({
      ownerId: OWNER_ID,
      type: "credential-saved",
      summary: "Stored OpenAI credential for external crossing.",
      details: {
        providerKey: "openai"
      }
    });
    return this.listProviderStatus();
  }

  async clearOpenAiCredential(): Promise<ProviderStatusRecord[]> {
    const current = await this.requireProvider("openai");
    await this.storage.putRecord(OWNER_ID, PROVIDER_COLLECTION, "openai", {
      ...current,
      credentialStored: false,
      apiKey: undefined,
      baseUrl: undefined,
      updatedAt: new Date().toISOString()
    });
    await this.coordination.recordEvent({
      ownerId: OWNER_ID,
      type: "credential-cleared",
      summary: "Cleared stored OpenAI credential.",
      details: {
        providerKey: "openai"
      }
    });
    return this.listProviderStatus();
  }

  async setMode(mode: IntegrationMode): Promise<ProviderStatusRecord[]> {
    const current = await this.requireProvider("openai");
    await this.storage.putRecord(OWNER_ID, PROVIDER_COLLECTION, "openai", {
      ...current,
      mode,
      updatedAt: new Date().toISOString()
    });
    await this.coordination.recordEvent({
      ownerId: OWNER_ID,
      type: "mode-changed",
      summary: `Integration mode changed to ${mode}.`,
      details: {
        providerKey: "openai",
        mode
      }
    });
    return this.listProviderStatus();
  }

  async inspectObservability(): Promise<IntegrationObservability> {
    const [providers, catalogs] = await Promise.all([
      this.listProviderStatus(),
      this.storage.listRecords<ProviderCatalogRecord>(OWNER_ID, CATALOG_COLLECTION)
    ]);
    return {
      storageRoot: this.storage.namespacePath(OWNER_ID),
      mode: providers[0]?.mode ?? "offline",
      catalogProviderCount: catalogs.length,
      catalogModelCount: catalogs.reduce((sum, catalog) => sum + catalog.modelCount, 0),
      providers,
      catalogs: catalogs.sort((left, right) => left.providerLabel.localeCompare(right.providerLabel))
    };
  }

  async importLegacyProviderInventory(input: {
    configRoots: string[];
    catalogRoots: string[];
  }): Promise<LegacyIntegrationImportReport> {
    const importedProviderConfigs: string[] = [];
    const importedCatalogs: string[] = [];

    for (const configRoot of input.configRoots.filter(Boolean)) {
      const providerConfigRoot = path.join(configRoot, "provider-configs");
      const configFiles = await readdir(providerConfigRoot, { withFileTypes: true }).catch(() => []);
      for (const configFile of configFiles) {
        if (!configFile.isFile() || !configFile.name.endsWith(".json")) {
          continue;
        }
        const configPath = path.join(providerConfigRoot, configFile.name);
        const legacy = await readJsonFile<LegacyProviderConfig>(configPath);
        if (!legacy?.providerKey) {
          continue;
        }
        const current = await this.storage.getRecord<ProviderConfigRecord>(
          OWNER_ID,
          PROVIDER_COLLECTION,
          legacy.providerKey
        );
        const next: ProviderConfigRecord = {
          providerKey: legacy.providerKey,
          providerLabel: providerLabelFromKey(legacy.providerKey),
          mode: legacy.mode === "online" ? "online" : "offline",
          credentialStored: Boolean(legacy.apiKey?.trim()),
          ...(legacy.apiKey?.trim() ? { apiKey: legacy.apiKey.trim() } : {}),
          ...(legacy.baseUrl?.trim() ? { baseUrl: legacy.baseUrl.trim() } : {}),
          updatedAt: new Date().toISOString()
        };
        await this.storage.putRecord(OWNER_ID, PROVIDER_COLLECTION, legacy.providerKey, {
          ...(current ?? {}),
          ...next
        });
        importedProviderConfigs.push(legacy.providerKey);
      }
    }

    for (const catalogRoot of input.catalogRoots.filter(Boolean)) {
      const providers = await readdir(catalogRoot, { withFileTypes: true }).catch(() => []);
      for (const provider of providers) {
        if (!provider.isDirectory()) {
          continue;
        }
        const providerKey = provider.name;
        const providerPath = path.join(catalogRoot, providerKey);
        const modelEntries = await readdir(providerPath, { withFileTypes: true }).catch(() => []);
        const modelCount = modelEntries.filter((entry) => entry.isDirectory()).length;
        const catalog: ProviderCatalogRecord = {
          providerKey,
          providerLabel: providerLabelFromKey(providerKey),
          modelCount,
          sourceRoot: providerPath,
          importedAt: new Date().toISOString()
        };
        await this.storage.putRecord(OWNER_ID, CATALOG_COLLECTION, providerKey, catalog);
        importedCatalogs.push(providerKey);
      }
    }

    if (importedProviderConfigs.length > 0 || importedCatalogs.length > 0) {
      await this.coordination.recordEvent({
        ownerId: OWNER_ID,
        type: "legacy-inventory-imported",
        summary: `Imported ${importedProviderConfigs.length} provider config(s) and ${importedCatalogs.length} provider catalog(s).`,
        details: {
          importedProviderConfigs,
          importedCatalogs
        }
      });
    }

    return {
      configRootsUsed: input.configRoots.filter(Boolean),
      catalogRootsUsed: input.catalogRoots.filter(Boolean),
      importedProviderConfigs,
      importedCatalogs
    };
  }

  private async requireProvider(providerKey: string): Promise<ProviderConfigRecord> {
    const provider = await this.storage.getRecord<ProviderConfigRecord>(
      OWNER_ID,
      PROVIDER_COLLECTION,
      providerKey
    );
    if (!provider) {
      throw new Error(`Provider ${providerKey} is not configured.`);
    }
    return provider;
  }
}

async function readJsonFile<T>(target: string): Promise<T | undefined> {
  try {
    const raw = await readFile(target, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function providerLabelFromKey(providerKey: string): string {
  if (providerKey === "openai") {
    return "OpenAI";
  }
  return providerKey
    .split(/[_-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
