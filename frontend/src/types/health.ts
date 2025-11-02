export interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: boolean;
}
