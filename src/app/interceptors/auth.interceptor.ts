import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip token for login/register endpoints
    if (request.url.includes('/auth/')) {
      return next.handle(request);
    }

    // Get the auth token from the service
    const authToken = this.authService.getToken();

    // Clone the request and add the authorization header
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    // Send the request and handle errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          this.authService.logout();
          
          // Store the current URL for redirecting after login
          const currentUrl = this.router.routerState.snapshot.url;
          if (currentUrl !== '/login') {
            this.authService.redirectUrl = currentUrl;
          }
          
          // Redirect to the login page
          this.router.navigate(['/login']);
        }
        
        // Pass the error to the calling service
        return throwError(error);
      })
    );
  }
}
