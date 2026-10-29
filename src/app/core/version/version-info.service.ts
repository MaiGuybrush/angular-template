import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { VERSION_INFO, VersionInfo } from './version.models';
import { compareSemver } from './semver.util';

function sanitizeMarkdownHtml(html: string): string {
  if (typeof window !== 'undefined') {
    const purify =
      typeof DOMPurify.sanitize === 'function'
        ? DOMPurify
        : (DOMPurify as unknown as (w: Window) => typeof DOMPurify)(window);
    return purify.sanitize(html);
  }
  return html;
}

@Injectable({
  providedIn: 'root',
})
export class VersionInfoService {
  private http = inject(HttpClient);
  readonly versionInfo = inject<VersionInfo>(VERSION_INFO);

  readonly isOpen = signal<boolean>(false);
  readonly displayVersions = signal<string[]>([]);
  readonly unreadVersions = signal<string[]>([]);
  readonly versionContents = signal<Record<string, string>>({});
  readonly isLoading = signal<boolean>(false);

  private getEffectiveSaveKey(): string {
    return this.versionInfo.readCompleteSaveKey || '--readVersionInfo';
  }

  private getLastReadVersion(): string | null {
    const primaryKey = this.versionInfo.readCompleteSaveKey;
    if (primaryKey) {
      const val = localStorage.getItem(primaryKey);
      if (val) return val;
    }
    return localStorage.getItem('--readVersionInfo');
  }

  showVersionInfoDialog(showAll = false): void {
    const lastRead = this.getLastReadVersion();
    const allVersions = this.versionInfo.versions || [];

    const unread = lastRead
      ? allVersions.filter((v) => compareSemver(v, lastRead) > 0)
      : [...allVersions];

    if (!showAll && unread.length === 0) {
      this.isOpen.set(false);
      return;
    }

    const versionsToShow = showAll ? [...allVersions] : [...unread];
    this.displayVersions.set(versionsToShow);
    this.unreadVersions.set(unread);
    this.isOpen.set(true);

    this.fetchReleaseNotes(versionsToShow);
  }

  private fetchReleaseNotes(versions: string[]): void {
    for (const version of versions) {
      if (this.versionContents()[version]) {
        continue;
      }

      const url = `./assets/versions/${version}/version-${version}.md`;
      this.http.get(url, { responseType: 'text' }).subscribe({
        next: (rawMarkdown) => {
          try {
            const rawHtml = marked.parse(rawMarkdown) as string;
            const cleanHtml = sanitizeMarkdownHtml(rawHtml);
            this.versionContents.update((prev) => ({
              ...prev,
              [version]: cleanHtml,
            }));
          } catch (e) {
            console.error(`Failed to parse release notes for version ${version}`, e);
            this.versionContents.update((prev) => ({
              ...prev,
              [version]: '<p>無法解析版本說明</p>',
            }));
          }
        },
        error: (err) => {
          console.warn(`Failed to fetch release note at ${url}`, err);
          this.versionContents.update((prev) => ({
            ...prev,
            [version]: '<p>暫無版本說明</p>',
          }));
        },
      });
    }
  }

  acknowledgeVersionInfo(): void {
    const latestVersion = this.versionInfo.versions?.[0];
    if (latestVersion) {
      const primaryKey = this.versionInfo.readCompleteSaveKey;
      if (primaryKey) {
        localStorage.setItem(primaryKey, latestVersion);
      }
      if (primaryKey !== '--readVersionInfo') {
        localStorage.setItem('--readVersionInfo', latestVersion);
      }
    }
    this.isOpen.set(false);
  }

  closeDialog(): void {
    this.isOpen.set(false);
  }
}
