
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { SplitterModule } from 'primeng/splitter';
import { CarouselModule } from 'primeng/carousel';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { BankingDataService } from '../../services/banking-data.service';
import { ToastModule } from 'primeng/toast';
import { CreditCard } from '../../interfaces/CreditCard.interface';
import { Account } from '../../interfaces/Account.interface';

import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-request-credit-card',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    StepsModule,
    CardModule,
    SplitterModule,
    CarouselModule,
    CheckboxModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    DialogModule
  ],
  templateUrl: './request-credit-card.component.html',
  styleUrls: ['./request-credit-card.component.scss'],
  providers: [MessageService]
})
export class RequestCreditCardComponent implements OnInit {
  instructions: any[];
  activeIndex: number = 0;
  cardTypes: any[];
  employmentStasuses: any[];
  branches: any[];
  termsAccepted: boolean = false;
  selectedCardType: any;
  accounts: Account[] = [];
  selectedAccount: Account | undefined;
  requestForm: FormGroup;
  displayTermsDialog: boolean = false;

  constructor(
    private messageService: MessageService,
    private bankingData: BankingDataService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.instructions = [
      {
        label: 'Card Type',
        title: 'Card Type',
        description: 'Choose the type of credit card that best suits your needs.'
      },
      {
        label: 'Employment & Income',
        title: 'Employment & Income',
        description: 'Provide your employment and income details to help us process your application.'
      },
      {
        label: 'Card Info',
        title: 'Card Info',
        description: 'Enter the name as you would like it to appear on your card and link an account.'
      },
      {
        label: 'Book Your Visit',
        title: 'Book Your Visit',
        description: 'Choose a branch to sign your papers or have them delivered to your location.'
      },
      {
        label: 'Confirmation',
        title: 'Confirmation',
        description: 'Review your application details before submitting.'
      }
    ];

    this.cardTypes = [
      { name: 'Classic', image: 'assets/ClassicCard.webp' },
      { name: 'Platinum', image: 'assets/PlatinumCard.webp' },
      { name: 'Signature', image: 'assets/SignatureCard.webp' },
      { name: 'Gold', image: 'assets/GoldCard.webp' },
    ];

    this.employmentStasuses = [
      { label: 'Employed', value: 'employed' },
      { label: 'Self-Employed', value: 'self-employed' },
      { label: 'Student', value: 'student' },
      { label: 'Unemployed', value: 'unemployed' },
      { label: 'Retired', value: 'retired' }
    ];

    this.branches = [
      { label: 'Main Branch', value: 'main' },
      { label: 'Downtown Branch', value: 'downtown' },
      { label: 'Uptown Branch', value: 'uptown' },
      { label: 'East Branch', value: 'east' },
      { label: 'West Branch', value: 'west' }
    ];

    this.requestForm = this.fb.group({
      cardType: [null, Validators.required],
      employmentStatus: [null, Validators.required],
      employerName: ['', Validators.required],
      occupation: ['', Validators.required],
      income: [null, Validators.required],
      otherIncome: [''],
      cardholderName: ['', Validators.required],
      selectedAccount: [null, Validators.required],
      branch: [null, Validators.required],
      deliveryAddress: [''],
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.accounts = this.bankingData.getAccounts();
  }

  showTermsDialog() {
    this.displayTermsDialog = true;
  }

  nextStep() {
    if (this.isStepValid()) {
      this.activeIndex++;
    }
  }

  isStepValid(): boolean {
    switch (this.activeIndex) {
      case 0:
        return this.requestForm.get('cardType')!.valid;
      case 1:
        return this.requestForm.get('employmentStatus')!.valid && this.requestForm.get('employerName')!.valid && this.requestForm.get('occupation')!.valid && this.requestForm.get('income')!.valid;
      case 2:
        return this.requestForm.get('cardholderName')!.valid && this.requestForm.get('selectedAccount')!.valid;
      case 3:
        return this.requestForm.get('branch')!.valid || this.requestForm.get('deliveryAddress')!.valid;
      case 4:
        return this.requestForm.get('termsAccepted')!.valid;
      default:
        return true;
    }
  }

  prevStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  goToDeliveryStep() {
    this.activeIndex = 5;
  }

  submitApplication() {
    if (!this.requestForm.get('termsAccepted')?.value) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please accept the terms and conditions.' });
      return;
    }

    if (!this.selectedAccount) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an account to link the card to.' });
      return;
    }

    const newCard: CreditCard = {
      id: Math.random().toString(36).substring(2, 9),
      cardNumber: this.generateCardNumber(),
      cardholderName: this.requestForm.value.cardholderName,
      expirationDate: this.generateExpiryDate(),
      cvv: this.generateCVV(),
      status: 'Pending',
      linkedAccountNumber: this.selectedAccount.number,
      cardType: this.selectedCardType.name
    };

    this.bankingData.addCreditCard(newCard);

    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Credit card requested successfully' 
    });

    setTimeout(() => {
      this.router.navigate(['/card-management/credit-cards']);
    }, 2000);
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
} 