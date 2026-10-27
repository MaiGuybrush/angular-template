import { EmpInfo } from '../auth/auth.models';

export interface RuntimeConfig {
  appTitle: string;
  authApiUrl: string;
  mockAuth?: boolean;
  mockUser?: Partial<EmpInfo> | EmpInfo;
  [key: string]: unknown;
}
