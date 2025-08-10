import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, fromEvent, of } from 'rxjs';
import { takeUntil, delay } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly MAX_OTP_ATTEMPTS = 3;

  private authState = new BehaviorSubject<boolean>(false);
  authState$ = this.authState.asObservable();
  private username: string = '';
  private destroy$ = new Subject<void>();
  private inactivityTimer: any;
  private otpAttempts = 0;
  private generatedOtp: string | null = null;

  // Store the URL so we can redirect after logging in
  public redirectUrl: string | null = null;

  // Events that will reset the inactivity timer
  private activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

  constructor(private router: Router) {
    this.checkExistingSession();
    this.setupInactivityTimer();
  }

  login(username: string, password: string): Observable<boolean> {
    // In a real app, this would be an HTTP call to your backend
    if (username === 'user' && password === 'password') {
      this.username = username;
      return of(true);
    }
    return of(false);
  }

  generateOtp(): Observable<string> {
    const Otp = 123456;
    this.generatedOtp = Otp.toString(); // Simulate OTP generation
    console.log(`Generated OTP: ${this.generatedOtp}`); // For simulation purposes
    return of(this.generatedOtp)
  }

  validateOtp(otp: string): Observable<{ success: boolean; message: string }> {
    if (this.otpAttempts >= this.MAX_OTP_ATTEMPTS) {
      return of({ success: false, message: 'Too many failed attempts. Please try again later.' });
    }

    if (otp === this.generatedOtp) {
      this.otpAttempts = 0;
      const token = this.generateToken();
      this.setSession(token);
      this.authState.next(true);
      this.resetInactivityTimer();
      const redirectUrl = this.redirectUrl || '/dashboard';
      this.router.navigateByUrl(redirectUrl);
      this.redirectUrl = null;
      return of({ success: true, message: 'Login successful!' });
    } else {
      this.otpAttempts++;
      const remainingAttempts = this.MAX_OTP_ATTEMPTS - this.otpAttempts;
      return of({ success: false, message: `Invalid OTP. ${remainingAttempts} attempts remaining.` });
    }
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