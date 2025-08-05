import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { BankingDataService } from '../../services/banking-data.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Transaction } from '../../interfaces/Transaction.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Table } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    RippleModule,
    TableModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    TagModule,
    ToastModule,
    TabViewModule
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('dt') dt: Table | undefined;

  transactions: Transaction[] = [];
  private subscription: Subscription | undefined;
  private queryParamSubscription: Subscription | undefined;

  accountOptions: any[] = [];
  accountFilterValue: string | null = null;

  constructor(
    private bankingDataService: BankingDataService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.subscription = this.bankingDataService.transactions$.subscribe(data => {
      this.transactions = data;
    });

    this.bankingDataService.accounts$.subscribe(data => {
      this.accountOptions = [
        { label: 'All Accounts', value: null },
        ...data.map(acc => ({ label: acc.number, value: acc.number }))
      ];
    });

    this.queryParamSubscription = this.route.queryParams.subscribe(params => {
      this.accountFilterValue = params['account'] || null;
      if (this.dt) {
          if (this.accountFilterValue) {
            this.dt?.filter(this.accountFilterValue, 'accountNumber', 'equals');
          } else {
            this.dt?.filter(null, 'accountNumber', 'equals');
          }
      }
    });
  }

  ngAfterViewInit(): void {
    // Apply filter if component is initialized with a query param, with a small delay
    if (this.dt && this.accountFilterValue) {
      this.dt?.filter(this.accountFilterValue, 'accountNumber', 'equals');
      this.cd.detectChanges();
    }
  }

  onAccountFilterChange(value: any) {
    if (this.dt) {
      this.dt.filter(value, 'accountNumber', 'equals');
      this.cd.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.queryParamSubscription) {
      this.queryParamSubscription.unsubscribe();
    }
  }

  clear(table: any) {
    table.clear();
    this.accountFilterValue = null; // Also clear the bound property
  }
}



