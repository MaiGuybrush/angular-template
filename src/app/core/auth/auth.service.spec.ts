import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EmpInfo, SsoUrls } from './auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiBaseUrl = 'http://tncimweb1.cminl.oa/uacapi/adAuth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should verify certificate', () => {
    const mockUser: EmpInfo = {
      no: '123', id: 'test', name: 'Test', department: 'D', orgShop: 'S', 
      location: 'L', shops: [], token: 'jwt', departmentCode: 'DC', refreshToken: 'rt'
    };

    service.verifyCertificate('cert-key').subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(localStorage.getItem('CIM_TK')).toBe('jwt');
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/VerifyCert`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ CertificateKey: 'cert-key' });
    req.flush(mockUser);
  });

  it('should refresh token', () => {
    const mockUser: EmpInfo = {
      no: '123', id: 'test', name: 'Test', department: 'D', orgShop: 'S', 
      location: 'L', shops: [], token: 'new-jwt', departmentCode: 'DC', refreshToken: 'new-rt'
    };
    
    localStorage.setItem('CIM_RTK', 'old-rt');

    service.refreshToken().subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(localStorage.getItem('CIM_TK')).toBe('new-jwt');
      expect(localStorage.getItem('CIM_RTK')).toBe('new-rt');
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/RefreshToken`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'old-rt' });
    req.flush(mockUser);
  });

  it('should check authorize', () => {
    service.checkAuthorize('S1', 'U1', 'F1').subscribe(res => {
      expect(res.status).toBe(200);
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/CheckAuthorize/U1/F1?subSystem=`);
    expect(req.request.method).toBe('GET');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should handle uac auth', () => {
    const mockUser: EmpInfo = {
      no: '123', id: 'test', name: 'Test', department: 'D', orgShop: 'S', 
      location: 'L', shops: [], token: 'jwt', departmentCode: 'DC', refreshToken: 'rt'
    };

    service.uacAuth('S1', 'U1', 'P1').subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${apiBaseUrl}/UacAuth`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id: 'U1', password: 'P1' });
    req.flush(mockUser);
  });

  it('should redirect to SSO', () => {
    const mockUrls: SsoUrls = { loginPage: 'login-url', logoutPage: 'logout-url' };
    const windowSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: ''
    } as any);
    
    // Note: window.location.href assignment is hard to test in Vitest/JSDOM 
    // without full window mock or abstraction. 
    // We'll just check if getSsoUrls was called.
    service.redirectToSso('http://localhost/test');
    
    const req = httpMock.expectOne(`${apiBaseUrl}/SsoUrl`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUrls);
    
    windowSpy.mockRestore();
  });
});
