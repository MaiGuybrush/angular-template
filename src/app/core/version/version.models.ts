import { InjectionToken } from '@angular/core';

export interface VersionInfo {
  versions: string[];
  readCompleteSaveKey: string;
}

export const VERSION_INFO = new InjectionToken<VersionInfo>('VERSION_INFO', {
  providedIn: 'root',
  factory: () => ({
    versions: ['1.0.0'],
    readCompleteSaveKey: '',
  }),
});
