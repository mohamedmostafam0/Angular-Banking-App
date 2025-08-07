import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BankingDataService } from '../../services/banking-data.service';
import { AuthService } from '../../services/auth.service';
import { Observable, of, Subscription } from 'rxjs';
import { Account } from '../../interfaces/Account.interface';
import { Transaction } from '../../interfaces/Transaction.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';  
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    RippleModule,
    TableModule,
    ChartModule,
    DropdownModule,
    InputNumberModule,
    ToastModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: []
})

export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('spendingByCategoryChart') spendingByCategoryChartRef!: ElementRef;
  @ViewChild('balanceTrendChart') balanceTrendChartRef!: ElementRef;
  @ViewChild('cashflowChart') cashflowChartRef!: ElementRef;

  accounts$: Observable<Account[]> = of([]);
  transactions$: Observable<Transaction[]> = of([]);
  username: string = '';

  // Chart data
  spendingByCategoryData: any;
  balanceTrendData: any;
  cashflowData: any;


  accountOptions: any[] = [];
  selectedAccountForBalanceTrend: string | null = null;

  private transactionsSubscription: Subscription | undefined;
  private accountsSubscription: Subscription | undefined;

  constructor(
    private bankingDataService: BankingDataService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
      this.accountsSubscription = this.bankingDataService.accounts$.subscribe(data => {
      this.accounts$ = of(data);
      this.accountOptions = [
        { label: 'All Accounts', value: null },
        ...data.map(acc => ({ label: acc.number, value: acc.number }))
      ];
    });

    this.transactionsSubscription = this.bankingDataService.transactions$.subscribe(data => {
      // this.transactions$ = of(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));
      this.prepareChartData(data);
    });

    this.username = this.authService.getUserName();
  }

  prepareChartData(transactions: Transaction[]) {
    let filteredTransactions = transactions;
    if (this.selectedAccountForBalanceTrend) {
      filteredTransactions = transactions.filter(t => t.accountNumber === this.selectedAccountForBalanceTrend);
    }

    // Spending by Category
    const categories = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const category = t.description;
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as { [key: string]: number });

    this.spendingByCategoryData = {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }
      ]
    };

    // Balance Trend
    const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = 0;
    const balanceData = sortedTransactions.map(t => {
      balance += t.amount;
      return { x: new Date(t.date), y: balance };
    });

    this.balanceTrendData = {
      labels: balanceData.map(d => d.x.toLocaleDateString()),
      datasets: [
        {
          label: 'Balance',
          data: balanceData.map(d => d.y),
          fill: true,
          borderColor: '#42A5F5',
          tension: .4
        }
      ]
    };

    // Cashflow Waterfall
    const income = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);

    this.cashflowData = {
      labels: ['Income', 'Expenses', 'Net Cashflow'],
      datasets: [
        {
          label: 'Amount',
          backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
          data: [income, Math.abs(expenses), income + expenses]
        }
      ]
    };
  }

  onAccountChangeForBalanceTrend(event: any) {
    this.selectedAccountForBalanceTrend = event.value;
    this.bankingDataService.transactions$.subscribe(data => {
      this.prepareChartData(data);
    });
  }


  ngOnDestroy(): void {
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
    if (this.accountsSubscription) {
      this.accountsSubscription.unsubscribe();
    }
  }
}
