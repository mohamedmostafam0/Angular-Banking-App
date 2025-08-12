import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, InputTextModule, ReactiveFormsModule, MessageModule, DialogModule, InputOtpModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  otpForm: FormGroup;
  submitted = false;
  errorMsg = '';
  showOtpDialog = false;
  otpErrorMsg = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    this.submitted = true;
    this.errorMsg = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.value;

    this.auth.login(username, password).subscribe(success => {
      this.loading = false;
      if (success) {
        this.auth.generateOtp().subscribe(() => {
          this.showOtpDialog = true;
        });
      } else {
        this.errorMsg = 'Invalid username or password';
      }
    });
  }

  onOtpSubmit(otp: string) {
    if (this.otpForm.invalid) {
      return;
    }

    this.loading = true;
    this.auth.validateOtp(otp).subscribe(response => {
      this.loading = false;
      if (response.success) {
        this.showOtpDialog = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.otpErrorMsg = response.message;
        this.otpForm.get('otp')?.reset();
      }
    });
  }

  onOtpChange(otp: string) {
    if (otp.length === 6) {
      this.onOtpSubmit(otp);
    }
  }
}