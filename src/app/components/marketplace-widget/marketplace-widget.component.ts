import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Added for ngModel

// PrimeNG Modules
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog'; // Added for p-dialog
import { ToastModule } from 'primeng/toast'; // Added for MessageService
import { MessageService } from 'primeng/api'; // Added for MessageService

// Services and Interfaces
import { BankingDataService } from '../../services/banking-data.service';
import { Account } from '../../interfaces/Account.interface';

@Component({
  selector: 'app-marketplace-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Added
    ReactiveFormsModule,
    CarouselModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CardModule,
    DialogModule, // Added
    ToastModule, // Added
  ],
  templateUrl: './marketplace-widget.component.html',
  styleUrls: ['./marketplace-widget.component.scss'],
  providers: [MessageService, BankingDataService] // Added BankingDataService and MessageService
})
export class MarketplaceWidgetComponent implements OnInit {
  marketplaceForm!: FormGroup;
  products: any[] = []; // This was for the original carousel, keeping it for now
  categories: any[] = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Home Goods', value: 'home_goods' },
    { label: 'Services', value: 'services' },
    { label: 'Vehicles', value: 'vehicles' },
    { label: 'Real Estate', value: 'real_estate' }
  ];

  // Moved from marketplace.component.ts
  utilities: any[] = [];
  selectedUtility: any;
  showDialog = false;
  billAmount = 0;
  accounts: Account[] = [];
  selectedAccount: Account | undefined;
  responsiveOptions: any[]; // This was already here, but now it will be initialized with the marketplace component's responsive options

  constructor(
    private fb: FormBuilder,
    private bankingData: BankingDataService,
    private messageService: MessageService
  ) {
    // Moved from marketplace.component.ts
    this.responsiveOptions = [
      {
          breakpoint: '1024px',
          numVisible: 3,
          numScroll: 3
      },
      {
          breakpoint: '768px',
          numVisible: 2,
          numScroll: 2
      },
      {
          breakpoint: '560px',
          numVisible: 1,
          numScroll: 1
      }
    ];
  }

  ngOnInit(): void {
    this.marketplaceForm = this.fb.group({
      productName: ['', Validators.required],
      category: [null, Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      description: ['']
    });

    // Moved from marketplace.component.ts
    this.utilities = [
      { name: 'Electricity', icon: 'pi-bolt' },
      { name: 'Water', logo: 'assets/water.svg' },
      { name: 'Gas', logo: 'assets/gas.svg' },
      { name: 'Internet', icon: 'pi-wifi' },
      { name: 'Phone', icon: 'pi-phone' }
    ];

    this.bankingData.accounts$.subscribe(accounts => {
      this.accounts = accounts;
    });

    // Original products for the carousel (keeping it for now, can be removed if not needed)
    this.products = [
      {
        name: 'Vintage Camera',
        image: 'https://primefaces.org/cdn/primeng/images/galleria/galleria1.jpg',
        description: 'A classic camera from the 70s, fully functional.',
        price: 250.00,
        category: 'electronics'
      },
      {
        name: 'Handmade Ceramic Mug',
        image: 'https://primefaces.org/cdn/primeng/images/galleria/galleria2.jpg',
        description: 'Unique, handcrafted mug for your morning coffee.',
        price: 25.00,
        category: 'home_goods'
      },
      {
        name: 'Gardening Service',
        image: 'https://primefaces.org/cdn/primeng/images/galleria/galleria3.jpg',
        description: 'Professional gardening and landscaping services.',
        price: 75.00,
        category: 'services'
      },
      {
        name: 'Mountain Bike',
        image: 'https://primefaces.org/cdn/primeng/images/galleria/galleria4.jpg',
        description: 'High-performance mountain bike, almost new.',
        price: 800.00,
        category: 'vehicles'
      },
      {
        name: 'Apartment for Rent',
        image: 'https://primefaces.org/cdn/primeng/images/galleria/galleria5.jpg',
        description: 'Spacious 2-bedroom apartment in city center.',
        price: 1500.00,
        category: 'real_estate'
      }
    ];
  }

  onSubmit(): void {
    if (this.marketplaceForm.valid) {
      console.log('Form Submitted!', this.marketplaceForm.value);
      // Here you would typically send the data to a backend service
      this.marketplaceForm.reset();
    } else {
      console.log('Form is invalid');
    }
  }

  // Moved from marketplace.component.ts
  selectUtility(utility: any) {
    this.selectedUtility = utility;
    this.billAmount = Math.floor(Math.random() * 100) + 20; // Random amount between 20 and 120
    this.showDialog = true;
  }

  // Moved from marketplace.component.ts
  payBill() {
    if (this.selectedAccount) {
      const success = this.bankingData.withdraw(this.selectedAccount.number, this.billAmount);
      if (success) {
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Payment successful!'});
      } else {
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Insufficient funds.'});
      }
      this.showDialog = false;
      this.selectedAccount = undefined;
    }
  }

  // Moved from marketplace.component.ts
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }
}