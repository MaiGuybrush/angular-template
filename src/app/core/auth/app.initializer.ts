import { AuthService } from './auth.service';
import { lastValueFrom, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export function appInitializer(authService: AuthService) {
  return () => {
    // 1. Parse URL for CertificateKey
    const params = new URLSearchParams(window.location.search);
    const certificateKey = params.get('CertificateKey');
    const currentUrl = window.location.href.split('#')[0]; // Clean hash

    let authObs$;

    if (certificateKey) {
      console.log('AppInit: Verifying Certificate');
      authObs$ = authService.verifyCertificate(certificateKey);
    } else {
      console.log('AppInit: Trying Auth (Restore Session)');
      authObs$ = authService.tryAuth(currentUrl, true);
    }

    // 2. Execute Auth Logic
    return lastValueFrom(
      authObs$.pipe(
        tap(user => {
          if (user) {
            console.log('AppInit: Auth Success', user.id);
            // Here we would do the shop configuration logic
            // e.g. store.dispatch(configShops(...))
            
            // Clean URL if CertificateKey was present
            if (certificateKey) {
               const cleanUrl = authService.removeURLParameter(window.location.href, 'CertificateKey');
               window.history.replaceState({}, '', cleanUrl);
            }
          } else {
             console.log('AppInit: Auth Failed or No Session');
          }
        }),
        catchError(err => {
            console.error('AppInit: Error', err);
            return of(null);
        })
      )
    );
  };
}
