import { Component, inject, signal, input, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ConfigService } from '../../core/config/config.service';
import { NavItem } from '../nav.models';
import { VersionInfoService } from '../../core/version/version-info.service';
import { VERSION_INFO, VersionInfo } from '../../core/version/version.models';
import { VersionDialogComponent } from '../version-dialog/version-dialog.component';

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    label: '儀表板 / Dashboard',
    route: '/dashboard',
    icon: 'dashboard',
  },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, VersionDialogComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
})
export class AppShellComponent {
  private authService = inject(AuthService);
  private configService = inject(ConfigService);
  private versionInfoService = inject(VersionInfoService);
  private versionInfo = inject<VersionInfo>(VERSION_INFO);

  readonly currentUser = this.authService.currentUser;
  readonly appTitle = this.configService.appTitle;

  readonly isSidebarCollapsed = signal<boolean>(false);

  readonly navItems = input<NavItem[]>(DEFAULT_NAV_ITEMS);

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        if (!this.versionInfo.readCompleteSaveKey) {
          const empId = user.no || user.id || '';
          const appTitle = this.configService.appTitle() || '';
          this.versionInfo.readCompleteSaveKey =
            empId || appTitle ? `${empId}-${appTitle}-readVersionInfo` : '--readVersionInfo';
        }
        this.versionInfoService.showVersionInfoDialog(false);
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((val) => !val);
  }

  logout(): void {
    this.authService.logOutObs().subscribe();
  }
}
