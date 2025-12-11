export interface ExternalApiConfig {
  name: string;
  status: 'configured' | 'missing';
  required: boolean;
  missingVariables?: string[];
  note?: string;
  affectedFeatures?: string[];
}

export interface ExternalApiMissing {
  service: string;
  missingVariables: string[];
  note?: string;
  affectedFeatures?: string[];
}

export interface ExternalApisSummary {
  total: number;
  configured: number;
  missing: number;
  missingRequired: number;
}

export interface ExternalApisData {
  configured: Record<string, ExternalApiConfig>;
  missing: ExternalApiMissing[];
  summary: ExternalApisSummary;
}

export interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: boolean;
  externalApis?: ExternalApisData;
}
