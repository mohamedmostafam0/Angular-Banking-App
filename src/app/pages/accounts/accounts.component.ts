import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankingDataService } from '../../services/banking-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Account } from '../../interfaces/Account.interface';
import { Transaction } from '../../interfaces/Transaction.interface';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { MenuModule } from 'primeng/menu';
import { InputNumberModule } from 'primeng/inputnumber';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  providers: [MessageService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ToolbarModule,
    CardModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    DialogModule,
    BadgeModule,
    TooltipModule,
    MenuModule,
    InputNumberModule
  ]
})
export class AccountsComponent implements OnInit, OnDestroy {
  accounts: Account[] = [];
  filteredAccounts: Account[] = [];
  private accountsSubscription: Subscription | undefined;

  // Filter options
  accountTypes: { label: string, value: string }[] = [
    { label: 'All Types', value: '' },
    { label: 'Current', value: 'Current' },
    { label: 'Savings', value: 'Savings' }
  ];
  accountStatuses: { label: string, value: string }[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  selectedType: string = '';
  selectedStatus: string = '';

  // Nickname editing
  editingAccount: Account | null = null;
  editedNickname: string = '';

  // Dialogs
  showAlertDialog = false;
  showStatementDialog = false;

  // Forms
  alertForm!: FormGroup;
  statementForm!: FormGroup;

  selectedAccount: Account | null = null;
  accountMenuItems: MenuItem[] = [];
  selectedAccountForMenu: Account | null = null;

  constructor(
    public bankingDataService: BankingDataService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.accountsSubscription = this.bankingDataService.accounts$.subscribe((accounts: Account[]) => {
      this.accounts = accounts;
      this.filterAccounts();
    });

    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.selectedType = params['type'];
      } else {
        this.selectedType = '';
      }
      this.filterAccounts();
    });

    this.alertForm = this.fb.group({
      alertType: ['lowBalance', Validators.required],
      threshold: [null, [Validators.required, Validators.min(0)]]
    });

    this.statementForm = this.fb.group({
      months: [3, Validators.required]
    });
  }

  ngOnDestroy() {
    if (this.accountsSubscription) {
      this.accountsSubscription.unsubscribe();
    }
  }

  getAccountIcon(accountType: string): string {
    switch (accountType.toLowerCase()) {
      case 'Current':
        return 'pi pi-wallet';
      case 'savings':
        return 'pi pi-money-bill';
      default:
        return 'pi pi-credit-card';
    }
  }

  filterAccounts() {
    this.filteredAccounts = this.accounts.filter(account => {
      const typeMatch = !this.selectedType || account.type === this.selectedType;
      const statusMatch = !this.selectedStatus || account.status === this.selectedStatus;
      return typeMatch && statusMatch;
    });
  }

  clearFilters() {
    this.selectedType = '';
    this.selectedStatus = '';
    this.filterAccounts();
  }

  isEditing(account: Account): boolean {
    return this.editingAccount?.number === account.number;
  }

  startEditing(account: Account, event: Event) {
    event.stopPropagation();
    this.editingAccount = { ...account };
    this.editedNickname = account.nickname || '';
  }

  saveNickname(account: Account) {
    if (this.editedNickname !== (account.nickname || '')) {
      const updatedAccount = { ...account, nickname: this.editedNickname };
      this.bankingDataService.updateAccount(updatedAccount);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Nickname updated successfully',
        life: 3000
      });
    }
    this.cancelEditing();
  }

  cancelEditing() {
    this.editingAccount = null;
    this.editedNickname = '';
  }

  onTransfer(account: Account) {
    this.router.navigate(['/transfer'], {
      queryParams: {
        fromAccount: account.number
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'Active' ? 'success' : 'danger';
  }

  viewTransactions(accountNumber: string): void {
    this.router.navigate(['/transactions'], { 
      queryParams: { account: accountNumber } 
    });
  }

  getAlertMessage(account: Account): string {
    if (!account.alerts) return '';

    const lowBalanceHit = account.alerts.lowBalance?.enabled && account.balance < account.alerts.lowBalance.threshold;
    if (lowBalanceHit) {
      return `Low balance: below $${account.alerts.lowBalance?.threshold}`;
    }

    const accountTransactions = this.bankingDataService.getTransactions()
      .filter((t: Transaction) => t.accountNumber === account.number);

    const largeTransactionHit = account.alerts?.largeTransaction?.enabled &&
      accountTransactions.some(t => Math.abs(t.amount) >= (account.alerts?.largeTransaction?.threshold || Infinity));

    if (largeTransactionHit) {
      return `Large transaction detected`;
    }

    return '';
  }

  checkAlertHit(account: Account): boolean {
    return this.getAlertMessage(account) !== '';
  }

  openMenu(event: any, menu: any, account: Account) {
    this.selectedAccountForMenu = account;
    this.accountMenuItems = [
      {
        label: 'Create Alert',
        icon: 'pi pi-bell',
        command: () => this.openAlertDialog(account)
      },
      {
        label: 'Generate Statement',
        icon: 'pi pi-file-pdf',
        command: () => this.openStatementDialog(account)
      }
    ];
    menu.toggle(event);
  }

  openAlertDialog(account: Account) {
    this.selectedAccount = account;
    this.alertForm.reset({ threshold: account.alerts?.lowBalance?.threshold });
    this.showAlertDialog = true;
  }

  openStatementDialog(account: Account) {
    this.selectedAccount = account;
    this.statementForm.reset({ months: 3 });
    this.showStatementDialog = true;
  }

  saveAlert() {
    if (!this.alertForm.valid || !this.selectedAccount) return;

    const alertType = this.alertForm.get('alertType')?.value;
    const threshold = this.alertForm.get('threshold')?.value;

    if (alertType === 'lowBalance') {
      this.bankingDataService.setLowBalanceAlert(this.selectedAccount.number, threshold);
    } else if (alertType === 'largeTransaction') {
      this.bankingDataService.setLargeTransactionAlert(this.selectedAccount.number, threshold);
    }

    this.showAlertDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Alert Saved',
      detail: `Alert for account ${this.selectedAccount.number} has been set.`,
      life: 3000
    });
  }

  exportStatement(format: 'pdf' | 'csv') {
    if (!this.statementForm.valid || !this.selectedAccount) return;

    const { transactions, startDate, endDate } = this.getStatementData();

    if (format === 'pdf') {
      this.exportPdf(this.selectedAccount, transactions, startDate, endDate);
    } else {
      this.exportCsv(this.selectedAccount, transactions, startDate, endDate);
    }

    this.showStatementDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Statement Generated',
      detail: `Statement for account ${this.selectedAccount.number} is being generated.`,
      life: 3000
    });
  }

  private getStatementData() {
    const months = this.statementForm.get('months')?.value;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = this.bankingDataService.getTransactionsByDateRange(
      this.selectedAccount!.number,
      startDate,
      endDate
    );

    return { transactions, startDate, endDate };
  }

  private exportPdf(account: Account, transactions: (any & { balance: number })[], startDate: Date, endDate: Date) {
    const doc = new jsPDF();
    doc.text(`Account Statement for ${account.number}`, 14, 16);
    doc.text(`From ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Description', 'Amount', 'Balance']],
      body: transactions.map(tx => [tx.date, tx.description, tx.amount, tx.balance.toFixed(2)]),
    });

    doc.save(`statement-${account.number}.pdf`);
  }

  private exportCsv(account: Account, transactions: (any & { balance: number })[], startDate: Date, endDate: Date) {
    const header = 'Date,Description,Amount,Balance\n';
    const rows = transactions.map(tx => `${tx.date},${tx.description},${tx.amount},${tx.balance.toFixed(2)}`).join('\n');
    const csvContent = header + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statement-${account.number}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
