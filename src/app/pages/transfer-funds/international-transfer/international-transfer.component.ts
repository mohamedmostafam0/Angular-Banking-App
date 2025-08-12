import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  countries: { label: string, value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private bankingDataService: BankingDataService,
    private currencyExchangeService: CurrencyExchangeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.countries = [    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo, Democratic Republic of the',
    'Congo, Republic of the',
    'Costa Rica',
    'Côte d\'Ivoire',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czechia',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kosovo',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Korea',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Palestine',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Korea',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Timor-Leste',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States of America',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City (Holy See)',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
  ].map(country => ({ label: country, value: country }));

    this.transferForm = this.fb.group({
      fromAccount: [null, Validators.required],
      toAccount: ['', Validators.required],
      beneficiaryName: ['', Validators.required],
      beneficiaryAddress: ['', Validators.required],
      country: [null, Validators.required],
      sortCode: [''],
      iban: ['', Validators.required],
      bankName: ['', Validators.required],
      bankAddress: ['', Validators.required],
      swiftBic: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      toCurrency: [null, Validators.required],
      purpose: ['', Validators.required]
    });

    this.bankingDataService.accounts$.subscribe(accounts => {
      this.accounts = accounts;
      this.route.queryParams.subscribe(params => {
        const accountNumber = params['accountNumber'];
        const currency = params['currency'];
        const iban = params['iban'];
        const swiftCode = params['swiftCode'];

        if (accountNumber) {
          this.transferForm.patchValue({ 
            toAccount: accountNumber,
            currency: currency,
            iban: iban,
            swiftBic: swiftCode
          });
        }
      });
    });

    this.supportedCurrencies = this.currencyExchangeService.getSupportedCurrencies();

    this.transferForm.get('country')?.valueChanges.subscribe(country => {
      const sortCodeControl = this.transferForm.get('sortCode');
      if (country === 'United Kingdom' || country === 'Ireland') {
        sortCodeControl?.setValidators([Validators.required, Validators.pattern(/^\d{2}-\d{2}-\d{2}$/)]);
      } else {
        sortCodeControl?.clearValidators();
      }
      sortCodeControl?.updateValueAndValidity();
    });
  }

  initiateTransfer() {
    if (this.transferForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Form', detail: 'Please fill in all fields correctly.' });
      return;
    }

    const { fromAccount, toAccount, beneficiaryName, beneficiaryAddress, iban, bankName, bankAddress, swiftBic, amount, currency, toCurrency, purpose } = this.transferForm.value;

    this.currencyExchangeService.getExchangeRate(currency, toCurrency)
      .subscribe(rate => {
        const convertedAmount = amount * rate;

        this.confirmationService.confirm({
          message: `Please review the following international transfer details:<br><br>
                    <strong>From Account:</strong> ${fromAccount.number}<br>
                    <strong>Beneficiary:</strong> ${beneficiaryName}<br>
                    <strong>Beneficiary Address:</strong> ${beneficiaryAddress}<br>
                    <strong>Beneficiary Account:</strong> ${toAccount}<br>
                    <strong>IBAN:</strong> ${iban}<br>
                    <strong>Bank:</strong> ${bankName}<br>
                    <strong>Bank Address:</strong> ${bankAddress}<br>
                    <strong>SWIFT/BIC:</strong> ${swiftBic}<br>
                    <strong>Purpose:</strong> ${purpose}<br><br>
                    <strong>Amount to Transfer:</strong> ${amount} ${currency}<br>
                    <strong>Recipient will receive approximately:</strong> ${convertedAmount.toFixed(2)} ${toCurrency}<br>
                    <strong>Exchange Rate:</strong> 1 ${currency} = ${rate} ${toCurrency}<br><br>
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
    const { fromAccount, toAccount, amount, toCurrency, beneficiaryName, beneficiaryAddress, iban, bankName, bankAddress, swiftBic, purpose } = this.transferForm.value;

    if (fromAccount.balance < amount) {
      this.messageService.add({ severity: 'error', summary: 'Insufficient Funds', detail: 'You do not have enough money to make this transfer.' });
      return;
    }

    this.bankingDataService.withdraw(fromAccount.number, amount);

    // In a real app, you would have a more complex system for international transfers.
    // For this simulation, we'll just log the converted amount and all the details.
    console.log(`Simulating international transfer with the following details:`);
    console.log(`  From Account: ${fromAccount.number}`);
    console.log(`  Beneficiary: ${beneficiaryName}`);
    console.log(`  Beneficiary Address: ${beneficiaryAddress}`);
    console.log(`  Beneficiary Account: ${toAccount}`);
    console.log(`  IBAN: ${iban}`);
    console.log(`  Bank: ${bankName}`);
    console.log(`  Bank Address: ${bankAddress}`);
    console.log(`  SWIFT/BIC: ${swiftBic}`);
    console.log(`  Purpose: ${purpose}`);
    console.log(`  Amount: ${amount} ${this.transferForm.value.currency}`);
    console.log(`  Converted Amount: ${convertedAmount.toFixed(2)} ${toCurrency}`);

    this.messageService.add({ severity: 'success', summary: 'Transfer Successful', detail: 'The funds have been transferred.' });
    this.transferForm.reset();
  }
}
