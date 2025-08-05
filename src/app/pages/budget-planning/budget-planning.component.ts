import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BankingDataService } from '../../services/banking-data.service';
import { Transaction } from '../../interfaces/Transaction.interface';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';

interface Budget {
  category: string;
  limit: number;
  spent: number;
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
    ToastModule
  ],
  templateUrl: './budget-planning.component.html',
  styleUrls: ['./budget-planning.component.scss'],
  providers: [MessageService]
})
export class BudgetPlanningComponent implements OnInit {
  budgetForm!: FormGroup;
  budgets: Budget[] = [];
  categories: CategoryOption[] = [];
  budgetChartData: any;
  chartOptions: any;

  constructor(
    private fb: FormBuilder,
    private bankingDataService: BankingDataService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      limit: [null, [Validators.required, Validators.min(1)]]
    });

    this.loadBudgets();
    this.bankingDataService.transactions$.subscribe(transactions => {
      this.extractCategories(transactions);
      this.calculateSpending(transactions);
      this.prepareChartData();
    });
    
    this.setChartOptions();
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
      category: this.budgetForm.value.category,
      limit: this.budgetForm.value.limit,
      spent: 0 // Will be recalculated
    };

    const existingIndex = this.budgets.findIndex(b => b.category === newBudget.category);
    if (existingIndex > -1) {
      this.budgets[existingIndex].limit = newBudget.limit;
      this.messageService.add({ severity: 'success', summary: 'Budget Updated', detail: `Budget for ${newBudget.category} updated.` });
    } else {
      this.budgets.push(newBudget);
      this.messageService.add({ severity: 'success', summary: 'Budget Set', detail: `Budget for ${newBudget.category} has been set.` });
    }

    localStorage.setItem('budgets', JSON.stringify(this.budgets));
    this.bankingDataService.transactions$.subscribe(transactions => {
        this.calculateSpending(transactions);
        this.prepareChartData();
    }).unsubscribe();
    this.budgetForm.reset();
  }

  removeBudget(category: string): void {
    this.budgets = this.budgets.filter(b => b.category !== category);
    localStorage.setItem('budgets', JSON.stringify(this.budgets));
    this.prepareChartData();
    this.messageService.add({ severity: 'info', summary: 'Budget Removed', detail: `Budget for ${category} has been removed.` });
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
    const labels = this.budgets.map(b => b.category);
    const spentData = this.budgets.map(b => b.spent);
    const limitData = this.budgets.map(b => b.limit);

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

  getUsage(budget: Budget): number {
    return budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
  }
}
