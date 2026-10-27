import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppShellComponent } from './app-shell.component';
import { AuthService } from '../../core/auth/auth.service';
import { ConfigService } from '../../core/config/config.service';
import { provideRouter } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { EmpInfo, SsoUrls } from '../../core/auth/auth.models';

describe('AppShellComponent', () => {
  let component: AppShellComponent;
  let fixture: ComponentFixture<AppShellComponent>;
  let authServiceMock: {
    currentUser: WritableSignal<EmpInfo | null>;
    logOutObs: ReturnType<typeof vi.fn>;
  };
  let configServiceMock: {
    appTitle: WritableSignal<string>;
  };

  beforeEach(async () => {
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
        location: 'Tainan'
      }),
      logOutObs: vi.fn().mockReturnValue(of({} as SsoUrls))
    };

    configServiceMock = {
      appTitle: signal('MES Production Monitor')
    };

    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render application title in header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title')?.textContent).toContain('MES Production Monitor');
  });

  it('should render employee info and shop context in header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const userSummary = compiled.querySelector('.user-profile')?.textContent;
    expect(userSummary).toContain('T12345');
    expect(userSummary).toContain('王小明');
    expect(userSummary).toContain('FAB1');
  });

  it('should render navigation items in sidebar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const navLinks = compiled.querySelectorAll('.sidebar-nav-item');
    expect(navLinks.length).toBeGreaterThan(0);
    expect(compiled.querySelector('.sidebar')?.textContent).toContain('Dashboard');
  });

  it('should support custom navItems input', () => {
    fixture.componentRef.setInput('navItems', [
      { label: '自訂報表 / Reports', route: '/reports', icon: 'report' }
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.sidebar')?.textContent).toContain('Reports');
  });

  it('should toggle sidebar collapsed state', () => {
    expect(component.isSidebarCollapsed()).toBe(false);
    component.toggleSidebar();
    expect(component.isSidebarCollapsed()).toBe(true);
    fixture.detectChanges();
    
    const sidebar = fixture.nativeElement.querySelector('.sidebar');
    expect(sidebar?.classList.contains('collapsed')).toBe(true);
  });

  it('should invoke authService.logOutObs when logout is clicked', () => {
    component.logout();
    expect(authServiceMock.logOutObs).toHaveBeenCalled();
  });
});
