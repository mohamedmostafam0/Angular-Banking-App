import { Component, OnInit, OnDestroy } from '@angular/core';
import { BankingDataService } from '../../services/banking-data.service';
import { Subscription } from 'rxjs';
import { Account } from '../../interfaces/Account.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';

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
    TagModule
  ],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
})
export class AccountsComponent implements OnInit, OnDestroy {
  accounts: Account[] = [];
  private subscription: Subscription | undefined;

  typeOptions: any[] = [];
  statusOptions: any[] = [];

  constructor(private bankingDataService: BankingDataService) {}

  ngOnInit(): void {
    this.subscription = this.bankingDataService.accounts$.subscribe(data => {
      this.accounts = data;
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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  clear(table: any) {
    table.clear();
  }
}

