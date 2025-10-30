export interface SetupStepStatus {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
}

export interface SetupStepData {
  step1: { hasPassword: boolean } | null;
  step2: { birthday: string } | null;
  step3: { country: string; timezone: string; language: string } | null;
  step4: { genres: string[] } | null;
}

export interface SetupStatusResponse {
  success: boolean;
  data: {
    allStatus: boolean;
    stepStatus: SetupStepStatus;
    stepData: SetupStepData;
    setupCompleted: boolean;
    setupSkipped: boolean;
    provider: string;
  }
}

export interface TwoFAStatus {
  twofactorenabled: boolean;
  twoFactorSetupCompleted: boolean;
  setupStep: string;
  failedAttempts: number;
  isLocked: boolean;
  lockedUntil: string | null;
  backupCodesCount: number;
}

export type SetupStatusData = Awaited<ReturnType<typeof import('../services/setupService').setupService.getSetupStatus>>;
