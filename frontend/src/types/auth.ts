// ใช้กลาง FE สำหรับ auth response
import { UserData } from './user';

export interface SessionData {
  sessionID: string;
  expiresAt: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: string;
}

export interface TokensData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthData {
  user: UserData;
  session: SessionData;
  tokens: TokensData;
}
