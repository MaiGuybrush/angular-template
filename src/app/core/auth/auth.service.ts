import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of, delay } from 'rxjs';
import { EmpInfo, SsoUrls } from './auth.models';

const TOKEN_KEY = "CIM_TK";
const USER_KEY = "CIM_USER";
const REFRESH_KEY = "CIM_RTK";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // Base URL for Auth API
  private authApiUrl = 'http://tncimweb1.cminl.oa/uacapi/adAuth';
  
  // State
  private _currentUser = signal<EmpInfo | null>(null);
  
  // Public signals
  currentUser = computed(() => this._currentUser());
  isAuthenticated = computed(() => !!this._currentUser()?.token);

  constructor() {
    this.loadUserFromStorage();
  }

  get token(): string {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  }

  private loadUserFromStorage() {
    const userJSON = localStorage.getItem(USER_KEY);
    if (userJSON) {
      try {
        const user = JSON.parse(userJSON) as EmpInfo;
        this._currentUser.set(user);
      } catch (e) {
        console.error('Failed to parse user from storage', e);
        this.clearLoginInfo();
      }
    }
  }

  saveUser(user: EmpInfo | null) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, user.token);
      localStorage.setItem(REFRESH_KEY, user.refreshToken);
      this._currentUser.set(user);
    } else {
      this.clearLoginInfo();
    }
  }

  clearLoginInfo() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this._currentUser.set(null);
  }

  verifyCertificate(certKey: string): Observable<EmpInfo> {
    return this.http.post<EmpInfo>(`${this.authApiUrl}/VerifyCert`, { CertificateKey: certKey })
      .pipe(tap(res => {
        if (res) {
          this.saveUser(res);
        }
      }));
  }

  refreshToken(): Observable<EmpInfo> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    return this.http.post<EmpInfo>(`${this.authApiUrl}/RefreshToken`, { refreshToken })
      .pipe(tap(res => {
        if (res) {
          this.saveUser(res);
        }
      }));
  }

  getSsoUrls(): Observable<SsoUrls> {
    return this.http.get<SsoUrls>(`${this.authApiUrl}/SsoUrl`);
  }

  logOutObs(): Observable<any> {
    this.clearLoginInfo();
    return this.http.get<SsoUrls>(`${this.authApiUrl}/Logout`).pipe(
      tap(urls => {
        const currentUrl = window.location.href.split('#')[0]; // Clean hash if any
        // In the ref, they use a utility to remove params, let's keep it simple for now or implement the util
        const returnUrl = this.removeURLParameter(currentUrl, 'CertificateKey');
        window.location.href = `${urls.logoutPage}?url=${encodeURIComponent(returnUrl)}`;
      })
    );
  }

  // Adapted from reference
  tryAuth(returnUrl: string, autoRedirectSso: boolean): Observable<EmpInfo | null> {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    // Note: The reference implementation sends refreshToken in body. 
    // It also seems to assume that if we have a refresh token we try to use it.
    // If not, we might fail immediately or return null.
    
    return this.http.post<EmpInfo>(`${this.authApiUrl}/RefreshToken`, { refreshToken })
      .pipe(
        tap(user => {
          this.saveUser(user);
        }),
        catchError(e => {
          console.log(`tryAuth error:`, e);
          return of(null);
        }),
        // Logic from ref: if null and autoRedirect, get SSO url and redirect
        tap(user => {
          if (!user && autoRedirectSso) {
             this.getSsoUrls().pipe(delay(100)) // slight delay
             .subscribe(urls => {
                const cleanReturnUrl = this.removeURLParameter(returnUrl, 'CertificateKey');
                window.location.href = `${urls.loginPage}?url=${encodeURIComponent(cleanReturnUrl)}`;
             });
          }
        })
      );
  }

  // Utility from reference
  removeURLParameter(url: string, parameter: string): string {
    const urlparts = url.split('?');
    if (urlparts.length >= 2) {
      const prefix = encodeURIComponent(parameter) + '=';
      const pars = urlparts[1].split(/[&;]/g);
      for (let i = pars.length; i-- > 0;) {
          if (pars[i].lastIndexOf(prefix, 0) !== -1) {
              pars.splice(i, 1);
          }
      }
      return urlparts[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
    }
    return url;
  }

  redirectToSso(returnUrl: string) {
    this.getSsoUrls().subscribe(urls => {
      const cleanReturnUrl = this.removeURLParameter(returnUrl, 'CertificateKey');
      window.location.href = `${urls.loginPage}?url=${encodeURIComponent(cleanReturnUrl)}`;
    });
  }

  checkAuthorize(shop: string, id: string, functionId: string, subSystem?: string): Observable<any> {
    return this.http.get(
      `${this.authApiUrl}/CheckAuthorize/${id}/${functionId}?subSystem=${subSystem ?? ''}`,
      { observe: 'response' }
    );
  }

  uacAuth(shop: string, id: string, password: string): Observable<EmpInfo> {
    // The reference uses a different URL for UAC auth usually, 
    // but let's assume it's part of the same base for now or adjust if we find more info.
    // Ref: this.configProvider.uacApiUrl(shop)
    return this.http.post<EmpInfo>(`${this.authApiUrl}/UacAuth`, { id, password })
      .pipe(tap(user => {
        if (user) {
          this.saveUser(user);
        }
      }));
  }
}
