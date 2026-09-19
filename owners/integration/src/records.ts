export type IntegrationMode = "online" | "offline";

export interface ProviderConfigRecord {
  providerKey: string;
  providerLabel: string;
  mode: IntegrationMode;
  credentialStored: boolean;
  apiKey?: string;
  baseUrl?: string;
  updatedAt: string;
}

export interface ProviderCatalogRecord {
  providerKey: string;
  providerLabel: string;
  modelCount: number;
  sourceRoot: string;
  importedAt: string;
}

export interface ProviderStatusRecord {
  providerKey: string;
  providerLabel: string;
  mode: IntegrationMode;
  configured: boolean;
  available: boolean;
  credentialSource: "stored-config" | "missing";
  checkedAt: string;
  message: string;
}

export interface IntegrationObservability {
  storageRoot: string;
  mode: IntegrationMode;
  catalogProviderCount: number;
  catalogModelCount: number;
  providers: ProviderStatusRecord[];
  catalogs: ProviderCatalogRecord[];
}

export interface LegacyIntegrationImportReport {
  configRootsUsed: string[];
  catalogRootsUsed: string[];
  importedProviderConfigs: string[];
  importedCatalogs: string[];
}
