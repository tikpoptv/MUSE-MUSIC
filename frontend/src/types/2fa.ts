export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  data: {
    qrCode: string;
    manualEntryKey: string;
  };
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
  };
}

export interface TwoFactorBackupCodesResponse {
  success: boolean;
  message: string;
  data: {
    backupCodes: string[];
  };
}

export interface TwoFactorStatusResponse {
  success: boolean;
  message: string;
  data: {
    twofactorenabled: boolean;
    twoFactorSetupCompleted: boolean;
    setupStep: string;
    failedAttempts: number;
    isLocked: boolean;
    lockedUntil: string | null;
    backupCodesCount: number;
  };
}

export interface TwoFactorDisableResponse {
  success: boolean;
  message: string;
  data: {
    disabled: boolean;
  };
}
