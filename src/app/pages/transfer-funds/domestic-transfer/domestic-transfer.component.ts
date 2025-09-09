import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BankingDataService } from '../../../services/banking-data.service';
import { Account } from '../../../interfaces/Account.interface';
import { MessageService, ConfirmationService, ConfirmEventType } from 'primeng/api';
import { CurrencyExchangeService } from '../../../services/currency-exchange.service';
import { Beneficiary } from '../../../interfaces/beneficiary';

import { SplitterModule } from 'primeng/splitter';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-domestic-transfer',
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
    SplitterModule,
    ChipModule,
    TooltipModule
  ],
  templateUrl: './domestic-transfer.component.html',
  styleUrls: ['./domestic-transfer.component.scss'],
  providers: []
})
export class DomesticTransferComponent implements OnInit {
  @Input() rearrangeMode: boolean = false;
  transferForm!: FormGroup;
  accounts: Account[] = [];
  supportedCurrencies: string[] = [];
  beneficiaries: Beneficiary[] = [];
  isOnDashboard: boolean = false;

  constructor(
    private fb: FormBuilder,
    private bankingDataService: BankingDataService,
    private messageService: MessageService,
    private currencyExchangeService: CurrencyExchangeService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isOnDashboard = this.router.url.includes('/dashboard');

    this.transferForm = this.fb.group({
      fromAccount: [null, Validators.required],
      toAccount: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required]
    });

    this.bankingDataService.accounts$.subscribe(accounts => {
      this.accounts = accounts;
    });

    this.supportedCurrencies = this.currencyExchangeService.getSupportedCurrencies();
    this.loadBeneficiaries(); // Load beneficiaries first

    this.route.params.subscribe(params => { // Subscribe to route params
      const beneficiaryId = params['beneficiaryId'];
      if (beneficiaryId) {
        const selectedBeneficiary = this.beneficiaries.find(b => b.id === beneficiaryId);
        if (selectedBeneficiary) {
          this.selectBeneficiary(selectedBeneficiary);
        }
      }
    });
  }

  loadBeneficiaries() {
    const data = localStorage.getItem('beneficiaries');
    this.beneficiaries = data ? JSON.parse(data) : [];
    // Filter for domestic beneficiaries
    this.beneficiaries = this.beneficiaries.filter(b => !b.isInternational);
  }

  selectBeneficiary(beneficiary: Beneficiary) {
    this.transferForm.patchValue({
      toAccount: beneficiary.accountNumber
    });
    this.messageService.add({ severity: 'info', summary: 'Beneficiary Selected', detail: `Selected ${beneficiary.name}` });
  }

  initiateTransfer() {
    if (this.transferForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Form', detail: 'Please fill in all fields correctly.' });
      return;
    }

    const { fromAccount, toAccount, amount, currency } = this.transferForm.value;

    this.confirmationService.confirm({
      message: `Are you sure you want to transfer ${amount} ${currency} from account ${fromAccount.number} to account number ${toAccount}?`,
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
    const { fromAccount, toAccount, amount } = this.transferForm.value;

    const success = this.bankingDataService.transfer(fromAccount.number, toAccount, amount, amount, 'Domestic Transfer');

    if (success) {
      this.messageService.add({ severity: 'success', summary: 'Transfer Successful', detail: 'The funds have been transferred.' });
      this.transferForm.reset();
    } else {
      this.messageService.add({ severity: 'error', summary: 'Transfer Failed', detail: 'An error occurred during the transfer. Please check the details and try again.' });
    }
  }
}