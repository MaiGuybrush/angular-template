import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/auth/auth.service';
import { signal } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const authServiceMock = {
      currentUser: signal({
        id: 'EMP888',
        name: '王小美',
        orgShop: 'FAB3'
      })
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render welcome title and user info', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Dashboard');
    expect(compiled.querySelector('.welcome-card')?.textContent).toContain('王小美');
    expect(compiled.querySelector('.welcome-card')?.textContent).toContain('EMP888');
    expect(compiled.querySelector('.welcome-card')?.textContent).toContain('FAB3');
  });
});
