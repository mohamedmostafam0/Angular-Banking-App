import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SplitterModule } from 'primeng/splitter';
import { ToastModule } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { BankingDataService } from '../../services/banking-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recurring-payments',
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
    SplitterModule,
    ToastModule,
    CarouselModule,
    InputTextModule,
    ConfirmDialogModule,
    DialogModule,
    ToolbarModule 
  ],
  templateUrl: './recurring-payments.component.html',
  styleUrls: ['./recurring-payments.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class RecurringPaymentsComponent implements OnInit {
  editPaymentForm: any;
  frequencies: any[] = [];
  recurringPayments: any[] = [];
  displayEditDialog: boolean = false;
  selectedPayment: any;

  constructor(private fb: FormBuilder, private confirmationService: ConfirmationService, private messageService: MessageService, private router: Router, private bankingDataService: BankingDataService) {
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

  navigateToAddPayment() {
    this.router.navigate(['/add-new-payment']);
  }

  editPayment(payment: any) {
    this.selectedPayment = payment;
    this.editPaymentForm.patchValue(payment);
    this.displayEditDialog = true;
  }

  savePayment() {
    if (this.editPaymentForm.valid) {
      const updatedPayment = this.editPaymentForm.value;
      const index = this.recurringPayments.findIndex(p => p === this.selectedPayment);
      if (index > -1) {
        const payments = [...this.recurringPayments];
        payments[index] = updatedPayment;
        this.bankingDataService.setRecurringPayments(payments);
        this.displayEditDialog = false;
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Payment updated successfully'});
      }
    }
  }

  deletePayment(payment: any) {
    this.confirmationService.confirm({
        message: 'Are you sure that you want to delete this recurring payment?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            const payments = this.recurringPayments.filter(p => p !== payment);
            this.bankingDataService.setRecurringPayments(payments);
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Payment deleted successfully'});
        }
    });
  }
}
