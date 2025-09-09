import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { BankingDataService } from '../../services/banking-data.service';
import { Account } from '../../interfaces/Account.interface';
import { DebitCard } from '../../interfaces/DebitCard.interface';
import { CreditCardNumberPipe } from '../../pipes/credit-card-number.pipe';
import { UppercaseTextPipe } from '../../pipes/uppercase-text.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debit-cards',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    ConfirmPopupModule,
    ToastModule,
    DropdownModule,
    CreditCardNumberPipe,
    ToolbarModule,
    UppercaseTextPipe
  ],
  templateUrl: './debit-cards.component.html',
  styleUrl: './debit-cards.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class DebitCardsComponent implements OnInit {
  showRequestDialog: boolean = false;
  requestForm!: FormGroup;
  accounts: Account[] = [];
  debitCards: DebitCard[] = [];
  isOnDashboard: boolean = false;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private bankingDataService: BankingDataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isOnDashboard = this.router.url.includes('/dashboard');

    this.requestForm = this.fb.group({
      cardholderName: ['', Validators.required],
      tiedAccount: [null, Validators.required]
    });

    this.bankingDataService.accounts$.subscribe(accounts => {
      this.accounts = accounts;
    });

    this.bankingDataService.debitCards$.subscribe(debitCards => {
      this.debitCards = debitCards;
    });
  }

  onAccountSelect(accountNumber: string) {
    // This method is needed for the custom dropdown template, but its logic is handled by formControlName
  }

  getAccountDetails(accountNumber: string): Account | undefined {
    return this.accounts.find(acc => acc.number === accountNumber);
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  confirmRequest(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to request a new debit card?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.sendRequest();
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      }
    });
  }

  sendRequest() {
    const cardholderName = this.requestForm.get('cardholderName')?.value;
    const tiedAccount = this.requestForm.get('tiedAccount')?.value.number;

    const newCard: DebitCard = {
      id: this.generateId(),
      cardNumber: this.generateCardNumber(),
      cardholderName: cardholderName,
      expirationDate: this.generateValidUntilDate(),
      cvv: this.generateCvv(),
      status: 'Active',
      dailyLimit: 1000, // Default daily limit
      linkedAccountNumber: tiedAccount
    };

    this.bankingDataService.addDebitCard(newCard);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Debit card request submitted!' });
    this.showRequestDialog = false;
    this.requestForm.reset();
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  generateCardNumber(): string {
    let cardNumber = '';
    for (let i = 0; i < 16; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    return cardNumber;
  }

  generateValidUntilDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 5);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  generateCvv(): string {
    return Math.floor(100 + Math.random() * 900).toString();
  }

  getStatusSeverity(status: string): "success" | "warn" | "danger" | "info" {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'warn';
      case 'Blocked':
        return 'danger';
      default:
        return 'info';
    }
  }
}
