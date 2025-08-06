import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  private authState = new BehaviorSubject<boolean>(false);
  authState$ = this.authState.asObservable();
  private username: string = '';
  private destroy$ = new Subject<void>();
  private inactivityTimer: any;
  
  // Store the URL so we can redirect after logging in
  public redirectUrl: string | null = null;
  
  // Events that will reset the inactivity timer
  private activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  

  constructor(private router: Router) {
    this.checkExistingSession();
    this.setupInactivityTimer();
  }
  
  
  login(username: string, password: string): boolean {
    // In a real app, this would be an HTTP call to your backend
    if (username === 'user' && password === 'password') {
      const token = this.generateToken();
      this.setSession(token);
      this.authState.next(true);
      this.username = username;
      this.resetInactivityTimer();
      
      // Navigate to the redirect URL if available, otherwise to dashboard
      const redirectUrl = this.redirectUrl || '/dashboard';
      this.router.navigateByUrl(redirectUrl);
      this.redirectUrl = null; // Clear the redirect URL after using it
      return true;
    }
    // If login fails, clear any existing session
    this.authState.next(false);
    this.username = '';
    return false;
  }
  
  checkExistingSession() {
    const token = this.getToken();
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (token && expiry) {
      const now = new Date().getTime();
      if (now < Number(expiry)) {
        // Token is still valid
        this.authState.next(true);
        this.username = 'user'; // In a real app, you'd get this from the token
        this.resetInactivityTimer();
      } else {
        this.clearSession();
      }
    }
  }
  
  private generateToken(): string {
    // In a real app, this would come from your backend
    return 'fake-jwt-token-' + Math.random().toString(36).substr(2);
  }
  
  private setSession(token: string) {
    const expiry = new Date().getTime() + this.INACTIVITY_TIMEOUT;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
  }
  
  private clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  
  /**
   * Get the current user information
   * @returns User object with name and other details
   */
  getUser(): { name: string } | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return {
      name: this.username || 'User'
    };
  }
  

  logout() {
    this.clearSession();
    this.authState.next(false);
    this.username = '';
    clearTimeout(this.inactivityTimer);
    this.router.navigate(['/login']);
  }

  private setupInactivityTimer() {
    // Reset timer on any user activity
    this.activityEvents.forEach(event => {
      fromEvent(window, event)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.resetInactivityTimer());
    });
  }
  
  private resetInactivityTimer() {
    // Clear any existing timer
    clearTimeout(this.inactivityTimer);
    
    // Set new timer
    this.inactivityTimer = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIMEOUT);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.inactivityTimer);
  }

  isAuthenticated(): boolean {
    return this.authState.getValue();
  }

  getUserName(): string {
    return this.username;
  }
} 