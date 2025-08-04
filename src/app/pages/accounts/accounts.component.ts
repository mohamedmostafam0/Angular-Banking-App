import { Component, OnInit, OnDestroy } from '@angular/core';
import { BankingDataService } from '../../services/banking-data.service';
import { Subscription } from 'rxjs';
import { Account } from '../../interfaces/Account.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectItem, MessageService } from 'primeng/api'; 
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    RippleModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit, OnDestroy {
  accounts: Account[] = [];
  private subscription: Subscription | undefined;
  editingAccount: Account | null = null;
  editedNickname: string = '';

  typeOptions: SelectItem[] = [];     
  statusOptions: SelectItem[] = [];   

  constructor(
    private bankingDataService: BankingDataService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

ngOnInit(): void {
  this.subscription = this.route.queryParamMap.subscribe(params => {
    const queryType = params.get('type');

    const data = this.bankingDataService.getAccounts();
    this.accounts = queryType ? data.filter(acc => acc.type === queryType) : data;

    this.typeOptions = [
      { label: 'All Types', value: null },
      ...Array.from(new Set(data.map(acc => acc.type))).map(type => ({ label: type, value: type }))
    ];
    this.statusOptions = [
      { label: 'All Statuses', value: null },
      ...Array.from(new Set(data.map(acc => acc.status))).map(status => ({ label: status, value: status }))
    ];
  });
}


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  clear(table: Table) {
    table.clear();
  }

  startEditing(account: Account, event: Event) {
    event.stopPropagation();
    this.editingAccount = { ...account };
    this.editedNickname = account.nickname || '';
  }

  saveNickname(account: Account) {
    if (this.editedNickname !== (account.nickname || '')) {
      const updatedAccount = { ...account, nickname: this.editedNickname };
      const accounts = this.accounts.map(acc => 
        acc.number === updatedAccount.number ? updatedAccount : acc
      );
      this.bankingDataService.updateAccount(updatedAccount);
      this.accounts = accounts;
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

  isEditing(account: Account): boolean {
    return this.editingAccount?.number === account.number;
  }
}
