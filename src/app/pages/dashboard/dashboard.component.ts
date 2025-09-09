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
import { DragDropModule } from 'primeng/dragdrop';
import { TooltipModule } from 'primeng/tooltip';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecurringPaymentsWidgetComponent } from '../../components/recurring-payments-widget/recurring-payments-widget.component';
import { DomesticTransferWidgetComponent } from '../../components/domestic-transfer-widget/domestic-transfer-widget.component';
import { InternationalTransferWidgetComponent } from '../../components/international-transfer-widget/international-transfer-widget.component';
import { IntraAccountTransferWidgetComponent } from '../../components/intra-account-transfer-widget/intra-account-transfer-widget.component';
import { WithinBankTransferWidgetComponent } from '../../components/within-bank-transfer-widget/within-bank-transfer-widget.component';
import { CreditCardWidgetComponent } from '../../components/credit-card-widget/credit-card-widget.component';
import { DebitCardWidgetComponent } from '../../components/debit-card-widget/debit-card-widget.component';
import { MarketplaceWidgetComponent } from '../../components/marketplace-widget/marketplace-widget.component';

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
    FormsModule,
    DragDropModule,
    RecurringPaymentsWidgetComponent,
    TooltipModule,
    TieredMenuModule,
    DomesticTransferWidgetComponent,
    InternationalTransferWidgetComponent,
    IntraAccountTransferWidgetComponent,
    WithinBankTransferWidgetComponent,
    CreditCardWidgetComponent,
    DebitCardWidgetComponent,
    MarketplaceWidgetComponent
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

  widgets: any[] = [
    { name: 'Credit Cards', component: 'app-credit-card-widget' },
    { name: 'Debit Cards', component: 'app-debit-card-widget' },
    { name: 'New Recurring Payment', component: 'app-recurring-payments-widget' },
    { name: 'Domestic Transfer', component: 'app-domestic-transfer-widget' },
    { name: 'International Transfer', component: 'ap~p-international-transfer-widget' },
    { name: 'Intra-Account Transfer', component: 'app-intra-account-transfer-widget' },
    { name: 'Within-Bank Transfer', component: 'app-within-bank-transfer-widget' },
    { name: 'Cash-flow Waterfall', component: 'cash-flow-waterfall-chart' },
    { name: 'Marketplace', component: 'app-marketplace-widget' }
  ];
  dashboardItems: any[] = [];
  rearrangeMode = false;
  draggedItem: any = null;
  dragOverItem: any = null;
  menuItems!: MenuItem[];

  private transactionsSubscription: Subscription | undefined;
  private accountsSubscription: Subscription | undefined;

  constructor(
    private bankingDataService: BankingDataService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardState();
    this.buildMenuItems();

    this.accountsSubscription = this.bankingDataService.accounts$.subscribe(data => {
      this.accounts$ = of(data);
      this.accountOptions = [
        { label: 'All Accounts', value: null },
        ...data.map(acc => ({ label: acc.number, value: acc.number }))
      ];
    });

    this.transactionsSubscription = this.bankingDataService.transactions$.subscribe(data => {
      this.prepareChartData(data);
    });

    this.username = this.authService.getUserName();
  }

  buildMenuItems(): void {
    const availableWidgets = this.widgets.filter(widget => 
      !this.dashboardItems.some(item => item.component === widget.component)
    );

    const quickTransferItems = availableWidgets
      .filter(w => w.component.includes('-transfer'))
      .map(w => ({ label: w.name, command: () => this.addNewWidget(w) }));

    const otherItems = availableWidgets
      .filter(w => !w.component.includes('-transfer'))
      .map(w => ({ label: w.name, command: () => this.addNewWidget(w) }));

    this.menuItems = [
      {
        label: 'Add Widget',
        icon: 'pi pi-plus',
        items: [
          {
            label: 'Quick Transfer',
            items: quickTransferItems
          },
          ...otherItems
        ]
      },
      {
        label: 'Rearrange Widgets',
        icon: 'pi pi-sort-amount-down',
        command: () => this.toggleRearrange()
      }
    ];
  }

  loadDashboardState() {
    const savedState = localStorage.getItem('dashboardState');
    if (savedState) {
      this.dashboardItems = JSON.parse(savedState);
    } else {
      this.dashboardItems = [
        { name: 'Spending by Category', component: 'spending-by-category-chart' },
        { name: 'Balance Trend', component: 'balance-trend-chart' },
        { name: 'Cash-flow Waterfall', component: 'cash-flow-waterfall-chart' }
      ];
    }
  }

  saveDashboardState() {
    localStorage.setItem('dashboardState', JSON.stringify(this.dashboardItems));
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

  addNewWidget(widget: any) {
    if (widget) {
      if (!this.dashboardItems.find(item => item.component === widget.component)) {
        // Reset isNew flag for all items
        this.dashboardItems.forEach(item => item.isNew = false);
        const newWidget = { ...widget, isNew: true };
        this.dashboardItems.push(newWidget);
        this.rearrangeMode = true;
        this.saveDashboardState();
        this.buildMenuItems();
      }
    }
  }

  removeWidget(widget: any) {
    this.dashboardItems = this.dashboardItems.filter(item => item !== widget);
    this.saveDashboardState();
    this.buildMenuItems();
  }

  toggleRearrange() {
    this.rearrangeMode = !this.rearrangeMode;
    if (!this.rearrangeMode) {
      // Reset isNew flag for all items when done rearranging
      this.dashboardItems.forEach(item => item.isNew = false);
    }
  }

  onDragStart(item: any) {
    this.draggedItem = item;
    // When dragging starts, the item is no longer "new" in terms of the tooltip
    if (item.isNew) {
      item.isNew = false;
    }
  }

  onDrop(droppedOnItem: any) {
    if (this.draggedItem) {
      const draggedItemIndex = this.dashboardItems.indexOf(this.draggedItem);
      const droppedOnItemIndex = this.dashboardItems.indexOf(droppedOnItem);
      
      [this.dashboardItems[draggedItemIndex], this.dashboardItems[droppedOnItemIndex]] = [this.dashboardItems[droppedOnItemIndex], this.dashboardItems[draggedItemIndex]];

      this.draggedItem = null;
      this.dragOverItem = null;
      this.saveDashboardState();
    }
  }

  onDragEnter(item: any) {
    this.dragOverItem = item;
  }

  onDragLeave() {
    this.dragOverItem = null;
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
