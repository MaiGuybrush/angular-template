import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppShellComponent } from './app-shell.component';
import { AuthService } from '../../core/auth/auth.service';
import { ConfigService } from '../../core/config/config.service';
import { provideRouter } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmpInfo, SsoUrls } from '../../core/auth/auth.models';
import {
  VERSION_INFO,
  VersionInfo,
  DEFAULT_READ_VERSION_SAVE_KEY,
} from '../../core/version/version.models';

describe('AppShellComponent', () => {
  let component: AppShellComponent;
  let fixture: ComponentFixture<AppShellComponent>;
  let httpTesting: HttpTestingController;
  let authServiceMock: {
    currentUser: WritableSignal<EmpInfo | null>;
    logOutObs: ReturnType<typeof vi.fn>;
  };
  let configServiceMock: {
    appTitle: WritableSignal<string>;
  };
  let versionInfoValue: VersionInfo;

  beforeEach(async () => {
    localStorage.clear();

    versionInfoValue = {
      versions: ['1.0.0'],
      readCompleteSaveKey: '',
    };

    authServiceMock = {
      currentUser: signal<EmpInfo | null>({
        no: '1',
        id: 'T12345',
        name: '王小明',
        orgShop: 'FAB1',
        shops: ['FAB1', 'FAB2'],
        token: 'tk',
        refreshToken: 'rtk',
        department: 'CIM',
        departmentCode: 'CIM01',
        location: 'Tainan',
      }),
      logOutObs: vi.fn().mockReturnValue(of({} as SsoUrls)),
    };

    configServiceMock = {
      appTitle: signal('MES Production Monitor'),
    };

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: VERSION_INFO, useValue: versionInfoValue },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AppShellComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should render application title in header', () => {
    fixture.detectChanges();
    const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
    req.forEach((r) => r.flush('# 1.0.0'));

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title')?.textContent).toContain('MES Production Monitor');
  });

  it('should render employee info and shop context in header', () => {
    fixture.detectChanges();
    const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
    req.forEach((r) => r.flush('# 1.0.0'));

    const compiled = fixture.nativeElement as HTMLElement;
    const userSummary = compiled.querySelector('.user-profile')?.textContent;
    expect(userSummary).toContain('T12345');
    expect(userSummary).toContain('王小明');
    expect(userSummary).toContain('FAB1');
  });

  it('should render navigation items in sidebar', () => {
    fixture.detectChanges();
    const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
    req.forEach((r) => r.flush('# 1.0.0'));

    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('.sidebar-nav-item');
    expect(navLinks.length).toBeGreaterThan(0);
    expect(compiled.querySelector('.sidebar')?.textContent).toContain('Dashboard');
  });

  it('should support custom navItems input', () => {
    fixture.detectChanges();
    const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
    req.forEach((r) => r.flush('# 1.0.0'));

    fixture.componentRef.setInput('navItems', [
      { label: '自訂報表 / Reports', route: '/reports', icon: 'report' },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.sidebar')?.textContent).toContain('Reports');
  });

  it('should toggle sidebar collapsed state', () => {
    fixture.detectChanges();
    const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
    req.forEach((r) => r.flush('# 1.0.0'));

    expect(component.isSidebarCollapsed()).toBe(false);
    component.toggleSidebar();
    expect(component.isSidebarCollapsed()).toBe(true);
    fixture.detectChanges();

    const sidebar = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebar?.classList.contains('collapsed')).toBe(true);
  });

  it('should invoke authService.logOutObs when logout is clicked', () => {
    fixture.detectChanges();
    const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
    req.forEach((r) => r.flush('# 1.0.0'));

    component.logout();
    expect(authServiceMock.logOutObs).toHaveBeenCalled();
  });

  describe('Header Three-Dots Dropdown Menu & On-Demand Version History', () => {
    it('should render three-dots menu button next to user profile and not render standalone logout button', () => {
      fixture.detectChanges();
      const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
      req.forEach((r) => r.flush('# 1.0.0'));

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.logout-btn')).toBeNull();

      const menuTrigger = compiled.querySelector('.menu-trigger-btn');
      expect(menuTrigger).toBeTruthy();
      expect(menuTrigger?.getAttribute('aria-label')).toBe('選單');
    });

    it('should toggle dropdown menu on clicking the three-dots button', () => {
      fixture.detectChanges();
      const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
      req.forEach((r) => r.flush('# 1.0.0'));

      const compiled = fixture.nativeElement as HTMLElement;
      const menuTrigger = compiled.querySelector('.menu-trigger-btn') as HTMLButtonElement;
      expect(compiled.querySelector('.dropdown-menu')).toBeNull();

      menuTrigger.click();
      fixture.detectChanges();

      const dropdown = compiled.querySelector('.dropdown-menu');
      expect(dropdown).toBeTruthy();
      expect(dropdown?.textContent).toContain('版本資訊');
      expect(dropdown?.textContent).toContain('登出');

      menuTrigger.click();
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-menu')).toBeNull();
    });

    it('should close dropdown menu when clicking outside', () => {
      fixture.detectChanges();
      const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
      req.forEach((r) => r.flush('# 1.0.0'));

      const compiled = fixture.nativeElement as HTMLElement;
      const menuTrigger = compiled.querySelector('.menu-trigger-btn') as HTMLButtonElement;
      menuTrigger.click();
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-menu')).toBeTruthy();

      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      expect(compiled.querySelector('.dropdown-menu')).toBeNull();
    });

    it('should open historical version timeline dialog with showAll = true when "版本資訊" is selected', () => {
      versionInfoValue.versions = ['1.2.0', '1.1.0', '1.0.0'];
      localStorage.setItem('1-MES Production Monitor-readVersionInfo', '1.2.0');

      fixture.detectChanges();
      httpTesting.expectNone('./assets/versions/1.2.0/version-1.2.0.md');
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.version-modal-dialog')).toBeNull();

      const menuTrigger = compiled.querySelector('.menu-trigger-btn') as HTMLButtonElement;
      menuTrigger.click();
      fixture.detectChanges();

      const menuItems = Array.from(compiled.querySelectorAll('.menu-item')) as HTMLButtonElement[];
      const versionItem = menuItems.find((el) => el.textContent?.includes('版本資訊'));
      expect(versionItem).toBeTruthy();

      versionItem?.click();
      fixture.detectChanges();

      expect(compiled.querySelector('.dropdown-menu')).toBeNull();

      const req1 = httpTesting.expectOne('./assets/versions/1.2.0/version-1.2.0.md');
      const req2 = httpTesting.expectOne('./assets/versions/1.1.0/version-1.1.0.md');
      const req3 = httpTesting.expectOne('./assets/versions/1.0.0/version-1.0.0.md');
      req1.flush('## 1.2.0 Features');
      req2.flush('## 1.1.0 Enhancements');
      req3.flush('## 1.0.0 Initial');
      fixture.detectChanges();

      expect(compiled.querySelector('.version-modal-dialog')).toBeTruthy();
      const cards = compiled.querySelectorAll('.timeline-card');
      expect(cards.length).toBe(3);
    });

    it('should invoke authService.logOutObs and close dropdown when "登出" is selected', () => {
      fixture.detectChanges();
      const req = httpTesting.match('./assets/versions/1.0.0/version-1.0.0.md');
      req.forEach((r) => r.flush('# 1.0.0'));

      const compiled = fixture.nativeElement as HTMLElement;
      const menuTrigger = compiled.querySelector('.menu-trigger-btn') as HTMLButtonElement;
      menuTrigger.click();
      fixture.detectChanges();

      const menuItems = Array.from(compiled.querySelectorAll('.menu-item')) as HTMLButtonElement[];
      const logoutItem = menuItems.find((el) => el.textContent?.includes('登出'));
      expect(logoutItem).toBeTruthy();

      logoutItem?.click();
      fixture.detectChanges();

      expect(authServiceMock.logOutObs).toHaveBeenCalled();
      expect(compiled.querySelector('.dropdown-menu')).toBeNull();
    });
  });

  describe('Version Auto-Detection & Timeline Dialog Integration', () => {
    it('should automatically open version dialog on login without prior localStorage entry, fetch markdown, and render NEW badge', () => {
      fixture.detectChanges();

      const req = httpTesting.expectOne('./assets/versions/1.0.0/version-1.0.0.md');
      expect(req.request.method).toBe('GET');
      req.flush('# 1.0.0\n- Enterprise AppShell Released\n- CIM SSO Integration');

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const dialog = compiled.querySelector('.version-modal-dialog');
      expect(dialog).toBeTruthy();

      const badge = compiled.querySelector('.badge-new');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toContain('NEW');

      const content = compiled.querySelector('.timeline-card')?.textContent;
      expect(content).toContain('Enterprise AppShell Released');
    });

    it('should close dialog and persist version acknowledgment to localStorage when "我知道了" is clicked', () => {
      fixture.detectChanges();
      httpTesting.expectOne('./assets/versions/1.0.0/version-1.0.0.md').flush('# 1.0.0');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const confirmBtn = compiled.querySelector('.btn-confirm') as HTMLButtonElement;
      expect(confirmBtn).toBeTruthy();
      expect(confirmBtn.textContent).toContain('我知道了');

      confirmBtn.click();
      fixture.detectChanges();

      expect(compiled.querySelector('.version-modal-dialog')).toBeNull();
      expect(localStorage.getItem('1-MES Production Monitor-readVersionInfo')).toBe('1.0.0');
    });

    it('should not open version dialog if current version is already acknowledged in localStorage', () => {
      localStorage.setItem('1-MES Production Monitor-readVersionInfo', '1.0.0');

      fixture.detectChanges();

      httpTesting.expectNone('./assets/versions/1.0.0/version-1.0.0.md');
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.version-modal-dialog')).toBeNull();
    });

    it('should filter and display only newer versions when upgrading from 1.0.0 to 1.2.0', () => {
      versionInfoValue.versions = ['1.2.0', '1.1.0', '1.0.0'];
      localStorage.setItem('1-MES Production Monitor-readVersionInfo', '1.0.0');

      fixture.detectChanges();

      const req1 = httpTesting.expectOne('./assets/versions/1.2.0/version-1.2.0.md');
      const req2 = httpTesting.expectOne('./assets/versions/1.1.0/version-1.1.0.md');
      httpTesting.expectNone('./assets/versions/1.0.0/version-1.0.0.md');

      req1.flush('## 1.2.0 Features');
      req2.flush('## 1.1.0 Bug Fixes');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll('.timeline-card');
      expect(cards.length).toBe(2);
      expect(compiled.textContent).toContain('1.2.0 Features');
      expect(compiled.textContent).toContain('1.1.0 Bug Fixes');
      expect(compiled.textContent).not.toContain('version-1.0.0');
    });

    it('should support shared workstation employee isolation when different employees log in', () => {
      // User 1 acknowledges 1.0.0
      localStorage.setItem('1-MES Production Monitor-readVersionInfo', '1.0.0');

      // User 2 logs in on the same machine
      authServiceMock.currentUser.set({
        no: '2',
        id: 'T67890',
        name: '李小華',
        orgShop: 'FAB2',
        shops: ['FAB2'],
        token: 'tk2',
        refreshToken: 'rtk2',
        department: 'CIM',
        departmentCode: 'CIM02',
        location: 'Tainan',
      });

      fixture.detectChanges();

      // User 2 should get the update notification because their key has no acknowledgment
      const req = httpTesting.expectOne('./assets/versions/1.0.0/version-1.0.0.md');
      req.flush('# 1.0.0');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.version-modal-dialog')).toBeTruthy();
    });

    it('should fallback to DEFAULT_READ_VERSION_SAVE_KEY when user identifier and appTitle are empty', () => {
      authServiceMock.currentUser.set({
        no: '',
        id: '',
        name: 'Guest',
        orgShop: '',
        shops: [],
        token: 'tk',
        refreshToken: 'rtk',
        department: '',
        departmentCode: '',
        location: '',
      });
      configServiceMock.appTitle.set('');

      fixture.detectChanges();

      const req = httpTesting.expectOne('./assets/versions/1.0.0/version-1.0.0.md');
      req.flush('# 1.0.0');
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const confirmBtn = compiled.querySelector('.btn-confirm') as HTMLButtonElement;
      confirmBtn.click();
      fixture.detectChanges();

      expect(localStorage.getItem(DEFAULT_READ_VERSION_SAVE_KEY)).toBe('1.0.0');
    });
  });
});
