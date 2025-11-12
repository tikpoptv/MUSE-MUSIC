export interface SystemLog {
  logID: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  category: string | null;
  message: string;
  details: any;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  userID: string | null;
  userRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestID: string | null;
  errorStack: string | null;
  errorCode: string | null;
  duration: number | null;
  createdAt: string;
}

export interface LogsResponse {
  logs: SystemLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LogStats {
  byLevel: {
    info?: number;
    error?: number;
    warn?: number;
    debug?: number;
  };
  errorCount: number;
  apiCallsCount: number;
}

export interface LogFilters {
  level?: 'info' | 'error' | 'warn' | 'debug';
  category?: string;
  userID?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

