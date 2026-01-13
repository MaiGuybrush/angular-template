import { TestBed } from '@angular/core/testing';
import { appInitializer } from './app.initializer';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('appInitializer', () => {
  let authService: any;

  beforeEach(() => {
    authService = {
      verifyCertificate: vi.fn(),
      tryAuth: vi.fn(),
      removeURLParameter: vi.fn().mockImplementation((url) => url)
    };
  });

  it('should call verifyCertificate if CertificateKey is present', async () => {
    // Mock window location
    const originalLocation = window.location;
    const originalHistory = window.history;
    
    delete (window as any).location;
    (window as any).location = { 
      href: 'http://localhost?CertificateKey=123',
      search: '?CertificateKey=123' 
    };
    
    // Mock history
    const replaceStateSpy = vi.fn();
    delete (window as any).history;
    (window as any).history = { replaceState: replaceStateSpy };

    authService.verifyCertificate.mockReturnValue(of({id: 'test'}));
    
    const initFn = appInitializer(authService);
    await initFn();

    expect(authService.verifyCertificate).toHaveBeenCalledWith('123');
    expect(replaceStateSpy).toHaveBeenCalled();
    
    // cleanup
    window.location = originalLocation as any;
    window.history = originalHistory as any;
  });

  it('should call tryAuth if CertificateKey is missing', async () => {
    // Mock window location
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { 
      href: 'http://localhost/app',
      search: '' 
    };

    authService.tryAuth.mockReturnValue(of({}));

    const initFn = appInitializer(authService);
    await initFn();

    expect(authService.tryAuth).toHaveBeenCalledWith('http://localhost/app', true);
    
    // cleanup
    window.location = originalLocation as any;
  });
});
