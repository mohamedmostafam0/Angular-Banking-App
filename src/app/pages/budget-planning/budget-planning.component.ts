import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingDataService } from '../../services/banking-data.service';
import { Transaction } from '../../interfaces/Transaction.interface';
import { MessageService, ConfirmationService } from 'primeng/api';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Account } from '../../interfaces/Account.interface';
import { FilterPipe } from '../../pipes/filter.pipe';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SplitterModule } from 'primeng/splitter';

interface Budget {
  accountNumber: string;
  category: string;
  limit: number;
  spent: number;
  currency: string;
}

interface CategoryOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-budget-planning',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    TableModule,
    ChartModule,
    ToastModule,
    FilterPipe,
    FormsModule,
    ConfirmDialogModule,
    SplitterModule
  ],
  templateUrl: './budget-planning.component.html',
  styleUrls: ['./budget-planning.component.scss'],
  providers: [ConfirmationService],
  animations: [
    trigger('formAnimation', [
      state('void', style({ height: '0', opacity: '0', overflow: 'hidden' })),
      state('visible', style({ height: '*', opacity: '1' })),
      transition('void => visible', [
        style({ height: '0', opacity: '0' }),
        animate('300ms ease-out', style({ height: '*', opacity: '1' }))
      ]),
      transition('visible => void', [
        style({ height: '*', opacity: '1' }),
        animate('300ms ease-in', style({ height: '0', opacity: '0' }))
      ])
    ])
  ]
})
export class BudgetPlanningComponent implements OnInit {
  budgetForm!: FormGroup;
  budgets: Budget[] = [];
  categories: CategoryOption[] = [];
  budgetChartData: any;
  chartOptions: any;
  supportedCurrencies: string[] = [];
  showBudgetForm: boolean = false;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;

  constructor(
    private fb: FormBuilder,
    private bankingDataService: BankingDataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      limit: [null, [Validators.required, Validators.min(1)]],
      currency: ['USD', Validators.required]
    });

    this.bankingDataService.accounts$.subscribe(accounts => {
      this.accounts = accounts;
      if (this.accounts.length > 0) {
        this.selectedAccount = this.accounts[0];
        this.loadBudgets();
        this.prepareChartData();
      }
    });

    this.supportedCurrencies = this.bankingDataService.getSupportedCurrencies();
    this.bankingDataService.transactions$.subscribe(transactions => {
      this.extractCategories(transactions);
      this.calculateSpending(transactions);
      this.prepareChartData();
    });
    
    this.setChartOptions();
  }

  onAccountChange(event: any) {
    this.selectedAccount = event.value;
    this.loadBudgets();
    this.prepareChartData();
  }

  loadBudgets(): void {
    const savedBudgets = localStorage.getItem('budgets');
    if (savedBudgets) {
      this.budgets = JSON.parse(savedBudgets);
    }
  }

  saveBudget(): void {
    if (this.budgetForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Form', detail: 'Please fill in all fields.' });
      return;
    }

    const newBudget: Budget = {
      accountNumber: this.selectedAccount!.number,
      category: this.budgetForm.value.category,
      limit: this.budgetForm.value.limit,
      spent: 0, // Will be recalculated
      currency: this.budgetForm.value.currency
    };

    const existingIndex = this.budgets.findIndex(b => b.category === newBudget.category && b.accountNumber === newBudget.accountNumber);
    const action = existingIndex > -1 ? 'update' : 'set';
    const summary = existingIndex > -1 ? 'Update Budget' : 'Set Budget';
    const message = `Are you sure you want to ${action} the budget for ${newBudget.category}?`;

    this.confirmationService.confirm({
      message: message,
      header: summary,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (existingIndex > -1) {
          this.budgets = this.budgets.map((b, i) => i === existingIndex ? { ...b, limit: newBudget.limit, currency: newBudget.currency } : b);
          this.messageService.add({ severity: 'success', summary: 'Budget Updated', detail: `Budget for ${newBudget.category} updated.` });
        } else {
          this.budgets = [...this.budgets, newBudget];
          this.messageService.add({ severity: 'success', summary: 'Budget Set', detail: `Budget for ${newBudget.category} has been set.` });
        }

        localStorage.setItem('budgets', JSON.stringify(this.budgets));
        this.bankingDataService.transactions$.subscribe(transactions => {
            this.calculateSpending(transactions);
            this.prepareChartData();
        }).unsubscribe();
        this.budgetForm.reset({ currency: 'USD' });
        this.showBudgetForm = false;
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelled', detail: `The budget ${action} was cancelled.` });
      }
    });
  }

  deleteBudget(budgetToDelete: Budget): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the budget for ${budgetToDelete.category}? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-trash',
      accept: () => {
        this.budgets = this.budgets.filter(b => !(b.category === budgetToDelete.category && b.accountNumber === budgetToDelete.accountNumber));
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
        this.prepareChartData(); 
        this.messageService.add({ severity: 'success', summary: 'Budget Deleted', detail: `Budget for ${budgetToDelete.category} has been deleted.` });
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelled', detail: 'Deletion was cancelled.' });
      }
    });
  }

  extractCategories(transactions: Transaction[]): void {
    const categorySet = new Set<string>();
    transactions
      .filter(t => t.amount < 0) // Only consider expenses
      .forEach(t => categorySet.add(t.description));
    this.categories = Array.from(categorySet).map(cat => ({ label: cat, value: cat }));
  }

  calculateSpending(transactions: Transaction[]): void {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    this.budgets.forEach(budget => {
      const spent = transactions
        .filter(t => {
          const transactionDate = new Date(t.date);
          return (
            t.accountNumber === budget.accountNumber &&
            t.description === budget.category &&
            t.amount < 0 &&
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      budget.spent = spent;
    });
  }

  prepareChartData(): void {
    if (!this.selectedAccount) return;
    const accountBudgets = this.budgets.filter(b => b.accountNumber === this.selectedAccount?.number);
    const labels = accountBudgets.map(b => b.category);
    const spentData = accountBudgets.map(b => b.spent);
    const limitData = accountBudgets.map(b => b.limit);

    this.budgetChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Spent',
          backgroundColor: '#42A5F5',
          data: spentData
        },
        {
          label: 'Budget Limit',
          backgroundColor: '#FFCA28',
          data: limitData
        }
      ]
    };
  }
  
  setChartOptions() {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
      
      this.chartOptions = {
          plugins: {
              legend: {
                  labels: {
                      color: textColor
                  }
              }
          },
          scales: {
              x: {
                  ticks: {
                      color: textColorSecondary
                  },
                  grid: {
                      color: surfaceBorder,
                      drawBorder: false
                  }
              },
              y: {
                  ticks: {
                      color: textColorSecondary
                  },
                  grid: {
                      color: surfaceBorder,
                      drawBorder: false
                  }
              }

          }
      };
  }

  toggleBudgetForm() {
    this.showBudgetForm = !this.showBudgetForm;
  }

  getUsage(budget: Budget): number {
    return budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
  }
}
