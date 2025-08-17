import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { BankingDataService } from '../../services/banking-data.service';
import { Loan } from '../../interfaces/Loan.interface';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { TimelineModule } from 'primeng/timeline';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-loan-tracking',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    StepsModule,
    CardModule,
    FormsModule,
    TimelineModule
  ],
  templateUrl: './loan-tracking.component.html',
  styleUrls: ['./loan-tracking.component.scss']
})
export class LoanTrackingComponent implements OnInit {
  loans: Loan[] = [];
  selectedLoan: Loan | undefined;
  events: any[] = [];

  constructor(private bankingDataService: BankingDataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.bankingDataService.loans$.subscribe(loans => {
      this.loans = loans;
      const loanId = this.route.snapshot.queryParamMap.get('id');
      if (loanId) {
        this.selectedLoan = this.loans.find(loan => loan.id === loanId);
        this.onLoanChange();
      }
    });
  }

  onLoanChange() {
    if (this.selectedLoan) {
      this.events = [
        { status: 'Application Sent', date: '15/10/2020 10:30', icon: 'pi pi-check' },
        { status: 'In Review', date: '15/10/2020 14:00', icon: 'pi pi-spin pi-spinner' },
        { status: 'Accepted', date: '16/10/2020 10:00', icon: 'pi pi-check' }
      ];
    }
  }
}
