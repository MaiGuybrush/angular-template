import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-container">
      <h1 class="text-2xl font-bold mb-4">企業營運工作台 / Dashboard</h1>
      <div class="welcome-card p-6 bg-white rounded-lg shadow-sm border border-slate-200">
        <h2 class="text-lg font-semibold text-slate-800">歡迎回來，{{ currentUser()?.name || '使用者' }}！</h2>
        <p class="text-sm text-slate-500 mt-1">目前登入工號：{{ currentUser()?.id }} | 所屬廠區：{{ currentUser()?.orgShop || 'N/A' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 16px;
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;
}
