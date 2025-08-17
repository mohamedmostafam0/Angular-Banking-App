import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
import { MessageService } from 'primeng/api';
import { BankingDataService } from '../../services/banking-data.service';
import { Account } from '../../interfaces/Account.interface';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DialogModule,
    DropdownModule,
    ToastModule,
    CarouselModule,
    SplitterModule
  ],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  providers: [MessageService]
})
export class MarketplaceComponent implements OnInit {
  utilities: any[] = [];
  selectedUtility: any;
  showDialog = false;
  billAmount = 0;
  accounts: Account[] = [];
  selectedAccount: Account | undefined;
  responsiveOptions: any[];

  constructor(
    private bankingData: BankingDataService,
    private messageService: MessageService
  ) {
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

  ngOnInit() {
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
  }

  selectUtility(utility: any) {
    this.selectedUtility = utility;
    this.billAmount = Math.floor(Math.random() * 100) + 20; // Random amount between 20 and 120
    this.showDialog = true;
  }

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

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }
}