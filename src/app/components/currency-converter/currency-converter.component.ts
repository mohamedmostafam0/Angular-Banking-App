import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { BankingDataService } from '../../services/banking-data.service';

export interface CurrencyOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    FormsModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    MessageModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss']
})
export class CurrencyConverterComponent implements OnInit {
  currencies: CurrencyOption[] = [
    { label: 'US Dollar', value: 'USD' },
    { label: 'Euro', value: 'EUR' },
    { label: 'Egyptian Pound', value: 'EGP' },
    { label: 'UAE Dirham', value: 'AED' },
    { label: 'Saudi Riyal', value: 'SAR' }
  ];

  converterForm!: FormGroup;
  result: number | null = null;
  loading = false;
  error: string | null = null;
  lastUpdated: Date | null = null;
  exchangeRates: { [key: string]: number } = {};
  exchangeRate: number = 1;

  constructor(
    private fb: FormBuilder,
    private bankingDataService: BankingDataService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.converterForm = this.fb.group({
      amount: [1, [Validators.required, Validators.min(0.01)]],
      fromCurrency: [this.currencies[0].value, Validators.required],
      toCurrency: [this.currencies[1].value, Validators.required]
    });

    // Initial conversion
    this.convert();
  }

  convert(): void {
    if (this.converterForm.invalid) return;
    
    const amount = this.converterForm.get('amount')?.value;
    const fromCurrency = this.converterForm.get('fromCurrency')?.value;
    const toCurrency = this.converterForm.get('toCurrency')?.value;
    
    if (!fromCurrency || !toCurrency) return;
    
    // If same currency, just set the result to the same amount
    if (fromCurrency === toCurrency) {
      this.result = amount;
      this.lastUpdated = new Date();
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // First, update the exchange rates if needed
    this.updateExchangeRates().then(() => {
      // Then perform the conversion
      this.bankingDataService.convert(amount, fromCurrency, toCurrency).subscribe({
        next: (result) => {
          this.result = result;
          this.loading = false;
          this.lastUpdated = new Date();

          const fromRate = this.exchangeRates[fromCurrency] || 1;
          const toRate = this.exchangeRates[toCurrency] || 1;
          this.exchangeRate = (1 / fromRate) * toRate;
          
          // Update the timestamp in local storage
          localStorage.setItem('lastCurrencyUpdate', this.lastUpdated.toISOString());
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Failed to convert currencies. Please try again later.';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.error,
            life: 5000
          });
        }
      });
    });
  }

  swapCurrencies(): void {
    const fromCurrency = this.converterForm.get('fromCurrency')?.value;
    const toCurrency = this.converterForm.get('toCurrency')?.value;
    
    if (fromCurrency && toCurrency) {
      this.converterForm.patchValue({
        fromCurrency: toCurrency,
        toCurrency: fromCurrency
      });
    }
  }

  getExchangeRate(from: string, to: string): number {
    if (from === to) return 1;
    
    // If we have the direct rate, return it
    const directRate = this.exchangeRates[`${from}_${to}`];
    if (directRate !== undefined) return directRate;
    
    // If we have the inverse rate, return its inverse
    const inverseRate = this.exchangeRates[`${to}_${from}`];
    if (inverseRate !== undefined) return 1 / inverseRate;
    
    // Try to find a common currency (like USD)
    if (from === 'USD' && this.exchangeRates[`USD_${to}`]) {
      return this.exchangeRates[`USD_${to}`];
    }
    
    if (to === 'USD' && this.exchangeRates[`${from}_USD`]) {
      return 1 / this.exchangeRates[`${from}_USD`];
    }
    
    // Default to 1 if we can't determine the rate
    return 1;
  }
  
  getInverseRate(from: string, to: string): number {
    const rate = this.getExchangeRate(from, to);
    return rate !== 0 ? 1 / rate : 0;
  }

  private updateExchangeRates(): Promise<void> {
    return new Promise((resolve, reject) => {
      const fromCurrency = this.converterForm.get('fromCurrency')?.value;
      const toCurrency = this.converterForm.get('toCurrency')?.value;
      
      if (!fromCurrency || !toCurrency) {
        resolve();
        return;
      }
      
      // Get all unique currency codes we need rates for
      const currencies = [fromCurrency, toCurrency];
      const uniqueCurrencies = [...new Set(currencies)];
      
      // Fetch all needed rates
      this.bankingDataService.getExchangeRates(uniqueCurrencies).subscribe({
        next: (rates) => {
          this.exchangeRates = { ...this.exchangeRates, ...rates };
          resolve();
        },
        error: (err) => {
          console.error('Failed to update exchange rates:', err);
          reject(err);
        }
      });
    });
  }
}
