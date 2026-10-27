import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ConfigService } from './config.service';
import { RuntimeConfig } from './config.models';

describe('ConfigService', () => {
  let service: ConfigService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConfigService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ConfigService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should load runtime config from assets/config.json and normalize authApiUrl', async () => {
    const mockConfig: RuntimeConfig = {
      appTitle: 'Enterprise MES Portal',
      authApiUrl: '/Apigateway/MesApiCore/',
      mockAuth: false
    };

    const loadPromise = service.loadConfig();

    const req = httpTesting.expectOne('assets/config.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockConfig);

    const result = await loadPromise;
    expect(result.appTitle).toBe('Enterprise MES Portal');
    expect(result.authApiUrl).toBe('/Apigateway/MesApiCore'); // trailing slash stripped
    expect(service.config()?.authApiUrl).toBe('/Apigateway/MesApiCore');
  });

  it('should correctly normalize relative and absolute URLs without trailing slashes', () => {
    expect(service.normalizeUrl('/uacapi/adAuth///')).toBe('/uacapi/adAuth');
    expect(service.normalizeUrl('http://tncimweb1.cminl.oa/uacapi/adAuth/')).toBe('http://tncimweb1.cminl.oa/uacapi/adAuth');
    expect(service.normalizeUrl('   /Apigateway/MesApiCore   ')).toBe('/Apigateway/MesApiCore');
  });

  it('should provide default values when assets/config.json fails to load', async () => {
    const loadPromise = service.loadConfig();

    const req = httpTesting.expectOne('assets/config.json');
    req.error(new ProgressEvent('Network error'));

    const result = await loadPromise;
    expect(result.appTitle).toBe('template-app');
    expect(result.authApiUrl).toBe('/uacapi/adAuth');
  });
});
