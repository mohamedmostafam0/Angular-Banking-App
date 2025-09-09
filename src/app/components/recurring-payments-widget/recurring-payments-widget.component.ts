import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';

import { BankingDataService } from '../../services/banking-data.service';

@Component({
  selector: 'app-recurring-payments-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    DropdownModule,
    InputNumberModule,
    CalendarModule,
    ButtonModule,
    TableModule,
    ToastModule,
    InputTextModule,
    ToolbarModule 
  ],
  templateUrl: './recurring-payments-widget.component.html',
  styleUrls: ['./recurring-payments-widget.component.scss']
})
export class RecurringPaymentsWidgetComponent implements OnInit {
  editPaymentForm: any;
  frequencies: any[] = [];
  recurringPayments: any[] = [];

  constructor(private fb: FormBuilder, private bankingDataService: BankingDataService) {
  }

  ngOnInit() {
    this.editPaymentForm = this.fb.group({
      selectedUtility: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      frequency: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null]
    });

    this.frequencies = [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' }
    ];

    this.bankingDataService.recurringPayments$.subscribe(payments => {
      this.recurringPayments = payments;
    });
  }

  // These methods are kept as placeholders, but their functionality will be handled by the parent component or a service
  navigateToAddPayment() {
    console.log('Navigate to add payment');
  }

  editPayment(payment: any) {
    console.log('Edit payment', payment);
  }

  deletePayment(payment: any) {
    console.log('Delete payment', payment);
  }
}
