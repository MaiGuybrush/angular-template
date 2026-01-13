import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { EmpInfo } from './auth.models';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = request;
    const token = this.authService.token;
    if (token) {
      authReq = this.addTokenHeader(request, token);
    }

    // Skip auth check requests
    // Using regex from sample: /(https?:\/\/)*.+\/Auth\/CheckAuthorize\/\d+\/[0-9a-zA-Z]*\?.*$/gm
    // Simplified check for now as we don't have the full URL structure defined yet
    if (authReq.url.includes('/Auth/CheckAuthorize')) {
        return next.handle(authReq);
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((user: EmpInfo) => {
          this.isRefreshing = false;
          // user might be null if refresh failed (though refreshToken returns Observable<EmpInfo>)
          // If our service returns null on failure (it shouldn't based on our implementation, but let's be safe)
          if (user && user.token) {
              this.refreshTokenSubject.next(user.token);
              return next.handle(this.addTokenHeader(request, user.token));
          } else {
              // Refresh failed
              return this.authService.logOutObs().pipe(
                  switchMap(() => throwError(() => new Error('Refresh token failed')))
              );
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          return this.authService.logOutObs().pipe(
            switchMap(() => throwError(() => err))
          );
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
            return next.handle(this.addTokenHeader(request, token!));
        })
      );
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
  }
}
