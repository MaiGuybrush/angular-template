import { Component, inject, signal, input } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ConfigService } from '../../core/config/config.service';
import { NavItem } from '../nav.models';

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    label: '儀表板 / Dashboard',
    route: '/dashboard',
    icon: 'dashboard'
  }
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css'
})
export class AppShellComponent {
  private authService = inject(AuthService);
  private configService = inject(ConfigService);

  readonly currentUser = this.authService.currentUser;
  readonly appTitle = this.configService.appTitle;

  readonly isSidebarCollapsed = signal<boolean>(false);

  readonly navItems = input<NavItem[]>(DEFAULT_NAV_ITEMS);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(val => !val);
  }

  logout(): void {
    this.authService.logOutObs().subscribe();
  }
}
