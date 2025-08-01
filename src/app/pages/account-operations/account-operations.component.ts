import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankingDataService } from '../../services/banking-data.service';
import { Subscription } from 'rxjs';
import { Account } from '../../interfaces/Account.interface';
import { MessageService } from 'primeng/api';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-account-operations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    MessageModule,
    RippleModule,
    ToastModule
  ],
  templateUrl: './account-operations.component.html',
  styleUrls: ['./account-operations.component.scss'],
  providers: [MessageService]
})

export class AccountOperationsComponent implements OnInit, OnDestroy {
  
  // Form and dialog state
  transactionForm!: FormGroup;
  showDialog = false;
  operationType: 'deposit' | 'withdraw' = 'deposit';
  processing = false;
  formSubmitted = false;
  formMessage = '';
  formMessageType: 'success' | 'error' | '' = '';
  selectedAccountDetails: Account | null = null;
  
  // Account data
  accounts: Account[] = [];
  
  // Account options for dropdown
  accountOptions: { label: string, value: string }[] = [];
  private subs: Subscription[] = [];

  constructor(
    private bankingData: BankingDataService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.initForm();
  }
  
  private initForm() {
    this.transactionForm = this.fb.group({
      account: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(10)]]
    });
  }
  
  ngOnInit() {
    this.subs.push(
      this.bankingData.accounts$.subscribe(accounts => {
        this.accounts = accounts;
        this.accountOptions = accounts.map(account => ({
          label: account.number,
          value: account.number
        }));
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  // Dialog methods
  openDialog(operation: 'deposit' | 'withdraw') {
    this.operationType = operation;
    this.showDialog = true;
    this.formMessage = '';
    this.formMessageType = '';
    this.formSubmitted = false;
    this.transactionForm.reset();
    this.selectedAccountDetails = null;
  }

  closeDialog() {
    this.showDialog = false;
    this.processing = false;
    this.formSubmitted = false;
    this.transactionForm.reset();
    this.selectedAccountDetails = null;
  }

  onAccountSelect(accountNumber: string) {
    this.selectedAccountDetails = this.accounts.find(acc => acc.number === accountNumber) || null;
    
    if (this.selectedAccountDetails) {
      const amountControl = this.transactionForm.get('amount');
      if (amountControl) {
        amountControl.setValidators([
          Validators.required,
          Validators.min(0.01)
        ]);
        amountControl.updateValueAndValidity();
      }
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getAccountDetails(accountNumber: string): Account | undefined {
    return this.accounts.find(acc => acc.number === accountNumber);
  }

  submitTransaction() {
    this.formSubmitted = true;
    
    if (this.transactionForm.invalid || !this.selectedAccountDetails) {
      this.formMessage = 'Please fill in all required fields correctly.';
      this.formMessageType = 'error';
      this.messageService.add({severity:'error', summary: 'Error', detail: this.formMessage});
      return;
    }

    this.processing = true;
    const amount = this.transactionForm.get('amount')?.value;
    const accountNumber = this.transactionForm.get('account')?.value;
    let success = false;
    
    if (this.operationType === 'deposit') {
      this.bankingData.deposit(accountNumber, amount);
      success = true;
    } else {
      success = this.bankingData.withdraw(accountNumber, amount);
    }
    
    this.processing = false;
    this.closeDialog();

    if (success) {
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Transaction processed successfully.'});
    } else {
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Transaction failed. Insufficient funds or invalid account.'});
    }
  }
}