import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BankingDataService } from '../../services/banking-data.service';
import { AuthService } from '../../services/auth.service';
import { CreditCard } from '../../interfaces/CreditCard.interface';
import { Account } from '../../interfaces/Account.interface';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { CreditCardNumberPipe } from '../../pipes/credit-card-number.pipe';
import { UppercaseTextPipe } from '../../pipes/uppercase-text.pipe';

@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmPopupModule,
    ToolbarModule,
    DialogModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    CreditCardNumberPipe,
    UppercaseTextPipe,
    TooltipModule,
    DividerModule,
  ],
  templateUrl: './credit-cards.component.html',
  styleUrls: ['./credit-cards.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class CreditCardsComponent implements OnInit {
  creditCards: CreditCard[] = [];
  activeCards: CreditCard[] = [];
  pendingCards: CreditCard[] = [];
  inactiveCards: CreditCard[] = [];
  accounts: Account[] = [];
  showRequestDialog = false;
  requestForm: FormGroup;

  constructor(
    private bankingDataService: BankingDataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.requestForm = this.fb.group({
      cardholderName: ['', Validators.required],
      nationalID: ['', Validators.required],
      address: ['', Validators.required],
      tiedAccount: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCreditCards();
    this.loadAccounts();
  }

  loadCreditCards(): void {
    this.creditCards = this.bankingDataService.getCreditCards();
    this.creditCards.push({
      id: 'dummy-active-1',
      cardNumber: '1111 2222 3333 4444',
      cardholderName: 'John Doe',
      expirationDate: '12/28',
      cvv: '123',
      status: 'Active',
      linkedAccountNumber: '1000000001',
      cardType: 'Visa'
    });
    this.creditCards.push({
      id: 'dummy-inactive-1',
      cardNumber: '5555 6666 7777 8888',
      cardholderName: 'Jane Smith',
      expirationDate: '06/25',
      cvv: '456',
      status: 'Blocked',
      linkedAccountNumber: '1000000002',
      cardType: 'Mastercard'
    });

    this.activeCards = this.creditCards.filter(c => c.status === 'Active');
    this.pendingCards = this.creditCards.filter(c => c.status === 'Pending');
    this.inactiveCards = this.creditCards.filter(c => c.status === 'Blocked');
  }

  loadAccounts(): void {
    this.accounts = this.bankingDataService.getAccounts();
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warn';
      case 'Blocked':
        return 'danger';
      default:
        return 'warn';
    }
  }

  getAccountDetails(accountNumber: string): Account | undefined {
    return this.accounts.find((acc) => acc.number === accountNumber);
  }

  formatCurrency(balance: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(balance);
  }

  onAccountSelect(account: Account): void {
    if (account) {
      this.requestForm.patchValue({
        cardholderName: this.authService.getUserName(),
      });
    }
  }

  

  

  generateCardNumber(): string {
    return Array.from({ length: 4 }, () =>
      Math.floor(1000 + Math.random() * 9000).toString()
    ).join(' ');
  }

  generateExpiryDate(): string {
    const today = new Date();
    const expiryYear = today.getFullYear() + 5;
    const expiryMonth = today.getMonth() + 1;
    return `${expiryMonth.toString().padStart(2, '0')}/${expiryYear
      .toString()
      .slice(-2)}`;
  }

  generateCVV(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  redirectToRequestNewCard(): void {
    this.router.navigate(['/card-management/request-credit-card']);
  }

  viewTransactions(accountNumber: string): void {
    this.router.navigate(['/transactions'], { queryParams: { account: accountNumber } });
  }
}