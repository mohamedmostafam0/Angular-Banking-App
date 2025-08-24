import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { StepsModule } from 'primeng/steps';
import { SplitterModule } from 'primeng/splitter';

import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';

import { MessageService, MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';

import { MessageModule } from 'primeng/message';

import { CurrencyExchangeService } from '../../services/currency-exchange.service';
import { Beneficiary } from '../../interfaces/beneficiary';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    ButtonModule,
    DialogModule,
    StepsModule,
    SplitterModule,
    InputTextModule,
    InputMaskModule,
    DropdownModule,
    RadioButtonModule,
    ToastModule,
    CardModule,
    MessageModule
  ],
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.scss'],
  providers: [MessageService]
})
export class BeneficiariesComponent implements OnInit {
  beneficiaryForm!: FormGroup;
  isEditMode: boolean = false;
  activeIndex: number = 0;
  steps!: MenuItem[];
  supportedCurrencies: string[] = [];
  instructions: any[];
  

  isStepValid(step: number): boolean {
    switch (step) {
      case 0:
        return this.beneficiaryForm.get('isInternational')!.valid;
      case 1:
        return (this.beneficiaryForm.get('name')?.valid ?? false) &&
               (this.beneficiaryForm.get('accountNumber')?.valid ?? false) &&
               (this.beneficiaryForm.get('bankName')?.valid ?? false) &&
               (this.beneficiaryForm.get('accountCurrency')?.valid ?? false);
      case 2:
        const isInternational = this.beneficiaryForm.get('isInternational')?.value;
        if (isInternational) {
          return (this.beneficiaryForm.get('swiftCode')?.valid ?? false) &&
                 (this.beneficiaryForm.get('iban')?.valid ?? false) &&
                 (this.beneficiaryForm.get('bankAddress')?.valid ?? false) &&
                 (this.beneficiaryForm.get('beneficiaryAddress')?.valid ?? false) &&
                 (this.beneficiaryForm.get('beneficiaryCountry')?.valid ?? false);
        } else {
          return (this.beneficiaryForm.get('bankBranchName')?.valid ?? false) &&
                 (this.beneficiaryForm.get('bankBranchCode')?.valid ?? false);
        }
      case 3:
        const isInternationalStep4 = this.beneficiaryForm.get('isInternational')?.value;
        if (isInternationalStep4) {
          return (this.beneficiaryForm.get('group')?.valid ?? false) &&
                 (this.beneficiaryForm.get('purposeNickname')?.valid ?? false) &&
                 (this.beneficiaryForm.get('purposeOfPayment')?.valid ?? false);
        } else {
          return (this.beneficiaryForm.get('group')?.valid ?? false) &&
                 (this.beneficiaryForm.get('purposeNickname')?.valid ?? false);
        }
      default:
        return true;
    }
  }

  groups = [
    { label: 'Family', value: 'Family' },
    { label: 'Business', value: 'Business' },
    { label: 'Other', value: 'Other' }
  ];

  countries = [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
    { label: 'United Kingdom', value: 'GB' },
    { label: 'Germany', value: 'DE' },
    { label: 'France', value: 'FR' },
    { label: 'Egypt', value: 'EG' },
    { label: 'United Arab Emirates', value: 'AE' },
    { label: 'Saudi Arabia', value: 'SA' },
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private currencyExchangeService: CurrencyExchangeService
  ) {
    this.instructions = [
      { title: 'Beneficiary Type', description: 'Select whether the beneficiary is domestic or international.' },
      { title: 'Core Details', description: 'Enter the main details of the beneficiary.' },
      { title: 'Address & Bank Info', description: 'Provide address and bank information.' },
      { title: 'Purpose & Group', description: 'Specify the purpose of the beneficiary and assign a group.' },
      { title: 'Review', description: 'Review all the details before saving.' }
    ];
  }

  ngOnInit(): void {
    this.steps = this.instructions.map(i => ({ label: i.title }));
    this.initForm();
    this.supportedCurrencies = this.currencyExchangeService.getSupportedCurrencies();
    this.beneficiaryForm.get('isInternational')?.valueChanges.subscribe(value => {
      this.updateInternationalValidators(value);
    });

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        const beneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');
        const beneficiaryToEdit = beneficiaries.find((b: Beneficiary) => b.id === id);
        if (beneficiaryToEdit) {
          this.beneficiaryForm.patchValue(beneficiaryToEdit);
        }
      } else {
        this.isEditMode = false;
      }
    });
  }

  initForm(): void {
    this.beneficiaryForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      accountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      bankBranchName: [''],
      bankBranchCode: [''],
      accountCurrency: ['', Validators.required],
      group: ['Family', Validators.required],
      isFavorite: [false],
      isInternational: [false],
      swiftCode: [''],
      iban: [''],
      bankAddress: [''],
      beneficiaryAddress: [''],
      beneficiaryCountry: [''],
      purposeNickname: [''],
      purposeOfPayment: ['']
    });
  }

  updateInternationalValidators(isInternational: boolean): void {
    const swiftCodeControl = this.beneficiaryForm.get('swiftCode');
    const ibanControl = this.beneficiaryForm.get('iban');
    const bankAddressControl = this.beneficiaryForm.get('bankAddress');
    const beneficiaryAddressControl = this.beneficiaryForm.get('beneficiaryAddress');
    const beneficiaryCountryControl = this.beneficiaryForm.get('beneficiaryCountry');
    const purposeOfPaymentControl = this.beneficiaryForm.get('purposeOfPayment');

    if (isInternational) {
      swiftCodeControl?.setValidators([Validators.required]);
      ibanControl?.setValidators([Validators.required]);
      bankAddressControl?.setValidators([Validators.required]);
      beneficiaryAddressControl?.setValidators([Validators.required]);
      beneficiaryCountryControl?.setValidators([Validators.required]);
      purposeOfPaymentControl?.setValidators([Validators.required]);
    } else {
      swiftCodeControl?.clearValidators();
      ibanControl?.clearValidators();
      bankAddressControl?.clearValidators();
      beneficiaryAddressControl?.clearValidators();
      beneficiaryCountryControl?.clearValidators();
      purposeOfPaymentControl?.clearValidators();
    }
    swiftCodeControl?.updateValueAndValidity();
    ibanControl?.updateValueAndValidity();
    bankAddressControl?.updateValueAndValidity();
    beneficiaryAddressControl?.updateValueAndValidity();
    beneficiaryCountryControl?.updateValueAndValidity();
    purposeOfPaymentControl?.updateValueAndValidity();
  }

  saveBeneficiary(): void {
    if (this.beneficiaryForm.invalid) {
      this.beneficiaryForm.markAllAsTouched();
      return;
    }

    const beneficiaryData = this.beneficiaryForm.value;
    let beneficiaries = JSON.parse(localStorage.getItem('beneficiaries') || '[]');

    if (this.isEditMode) {
      const index = beneficiaries.findIndex((b: Beneficiary) => b.id === beneficiaryData.id);
      if (index > -1) {
        beneficiaries[index] = beneficiaryData;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Beneficiary updated' });
      }
    } else {
      beneficiaryData.id = this.createId();
      beneficiaries.push(beneficiaryData);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Beneficiary created' });
    }

    localStorage.setItem('beneficiaries', JSON.stringify(beneficiaries));
    this.router.navigate(['/view-beneficiaries']);
  }

  cancel(): void {
    this.router.navigate(['/view-beneficiaries']);
  }

  createId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  nextStep() {
    if (this.isStepValid(this.activeIndex)) {
      this.activeIndex++;
    }
  }

  prevStep() {
    this.activeIndex--;
  }
}
