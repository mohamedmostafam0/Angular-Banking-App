import { Component, OnInit } from '@angular/core';
import { BankingDataService } from '../../services/banking-data.service';
import { AuthService } from '../../services/auth.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Account } from '../../interfaces/Account.interface';
import { Transaction } from '../../interfaces/Transaction.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';  
import { TableModule } from 'primeng/table';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    RippleModule,
    TableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  accounts$: Observable<Account[]> = of([]);
  transactions$: Observable<Transaction[]> = of([]);
  username: string = '';

  constructor(
    private bankingDataService: BankingDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.accounts$ = this.bankingDataService.accounts$;
    this.transactions$ = this.bankingDataService.transactions$.pipe(
      map(transactions => transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5))
    );
    this.username = this.authService.getUserName();
  }
}
