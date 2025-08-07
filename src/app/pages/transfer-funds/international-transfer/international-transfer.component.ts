import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingDataService } from '../../../services/banking-data.service';
import { CurrencyExchangeService } from '../../../services/currency-exchange.service';
import { Account } from '../../../interfaces/Account.interface';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-international-transfer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    SplitterModule
  ],
  templateUrl: './international-transfer.component.html',
  styleUrls: ['./international-transfer.component.scss'],
  providers: []
})
export class InternationalTransferComponent implements OnInit {
  transferForm!: FormGroup;
  accounts: Account[] = [];
  supportedCurrencies: string[] = [];

  constructor(
    private fb: FormBuilder,
    private bankingDataService: BankingDataService,
    private currencyExchangeService: CurrencyExchangeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.transferForm = this.fb.group({
      fromAccount: [null, Validators.required],
      toAccount: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      toCurrency: [null, Validators.required]
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

    const { fromAccount, toAccount, amount, currency, toCurrency } = this.transferForm.value;

    this.currencyExchangeService.getExchangeRate(currency, toCurrency)
      .subscribe(rate => {
        const convertedAmount = amount * rate;

        this.confirmationService.confirm({
          message: `You are about to transfer ${amount} ${currency} to account ${toAccount}.<br><br>
                    The recipient will receive approximately <strong>${convertedAmount.toFixed(2)} ${toCurrency}</strong>.<br>
                    (Exchange Rate: 1 ${currency} = ${rate} ${toCurrency})<br><br>
                    Do you want to proceed?`,
          header: 'Confirm International Transfer',
          icon: 'pi pi-globe',
          accept: () => {
            this.executeTransfer(convertedAmount);
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
      });
  }

  executeTransfer(convertedAmount: number) {
    const { fromAccount, toAccount, amount, toCurrency } = this.transferForm.value;

    if (fromAccount.balance < amount) {
      this.messageService.add({ severity: 'error', summary: 'Insufficient Funds', detail: 'You do not have enough money to make this transfer.' });
      return;
    }

    this.bankingDataService.withdraw(fromAccount.number, amount);

    // In a real app, you would have a more complex system for international transfers.
    // For this simulation, we'll just log the converted amount.
    console.log(`Simulating international transfer of ${convertedAmount.toFixed(2)} ${toCurrency} to account ${toAccount}`);

    this.messageService.add({ severity: 'success', summary: 'Transfer Successful', detail: 'The funds have been transferred.' });
    this.transferForm.reset();
  }
}
