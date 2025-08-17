import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingDataService } from '../../../services/banking-data.service';
import { Account } from '../../../interfaces/Account.interface';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { CurrencyExchangeService } from '../../../services/currency-exchange.service';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-within-bank-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    ToastModule,
    SplitterModule,
    ConfirmDialogModule,
    InputTextModule
  ],
  templateUrl: './within-bank-transfer.component.html',
  styleUrls: ['./within-bank-transfer.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class WithinBankTransferComponent implements OnInit {
  transferForm!: FormGroup;
  accounts: Account[] = [];
  supportedCurrencies: string[] = [];

  constructor(
    private fb: FormBuilder,
    private bankingDataService: BankingDataService,
    private messageService: MessageService,
    private currencyExchangeService: CurrencyExchangeService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.transferForm = this.fb.group({
      fromAccount: [null, Validators.required],
      recipientAccount: ['', [Validators.required, Validators.pattern('^[0-9]{10,16}$')]], // Assuming account numbers are 10-16 digits
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      description: ['']
    });

    this.bankingDataService.accounts$.subscribe(accounts => {
      this.accounts = accounts;
    });

    this.supportedCurrencies = this.currencyExchangeService.getSupportedCurrencies();
  }

  initiateTransfer() {
    if (this.transferForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Form', detail: 'Please fill in all fields correctly.' });
      return;
    }

    const { fromAccount, recipientAccount, amount, currency } = this.transferForm.value;

    this.confirmationService.confirm({
      message: `Are you sure you want to transfer ${amount} ${currency} from account ${fromAccount.number} to ${recipientAccount}?`,
      header: 'Confirm Transfer',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.executeTransfer();
      },
      reject: (type: ConfirmEventType) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.messageService.add({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected the transfer.' });
            break;
          case ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'info', summary: 'Cancelled', detail: 'You have cancelled the transfer.' });
            break;
        }
      }
    });
  }

  executeTransfer() {
    const { fromAccount, recipientAccount, amount } = this.transferForm.value;

    if (fromAccount.balance < amount) {
      this.messageService.add({ severity: 'error', summary: 'Insufficient Funds', detail: 'You do not have enough money to make this transfer.' });
      return;
    }

    // For demonstration, we'll just deduct from the source account.
    // In a real app, you'd also credit the recipient's account.
    this.bankingDataService.withdraw(fromAccount.number, amount);

    this.messageService.add({ severity: 'success', summary: 'Transfer Successful', detail: 'The funds have been transferred.' });
    this.transferForm.reset({ currency: 'USD' });
  }
}
