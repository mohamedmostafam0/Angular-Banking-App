import { Component, OnInit } from '@angular/core';
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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';

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
    DialogModule
  ],
  templateUrl: './recurring-payments.component.html',
  styleUrls: ['./recurring-payments.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class RecurringPaymentsComponent implements OnInit {
  recurringPaymentForm: any;
  editPaymentForm: any;
  frequencies: any[] = [];
  recurringPayments: any[] = [];
  utilities: any[] = [];
  responsiveOptions: any[];
  displayEditDialog: boolean = false;
  selectedPayment: any;

  constructor(private fb: FormBuilder, private confirmationService: ConfirmationService, private messageService: MessageService) {
    this.responsiveOptions = [
      {
          breakpoint: '1024px',
          numVisible: 3,
          numScroll: 3
      },
      {
          breakpoint: '768px',
          numVisible: 2,
          numScroll: 2
      },
      {
          breakpoint: '560px',
          numVisible: 1,
          numScroll: 1
      }
  ];
  }

  ngOnInit() {
    this.recurringPaymentForm = this.fb.group({
      selectedUtility: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      frequency: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null]
    });

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

    this.utilities = [
      { name: 'Electricity', icon: 'pi-bolt' },
      { name: 'Water', logo: 'assets/water.svg' },
      { name: 'Gas', logo: 'assets/gas.svg' },
      { name: 'Internet', icon: 'pi-wifi' },
      { name: 'Phone', icon: 'pi-phone' }
    ];

    this.recurringPayments = [
      {
        selectedUtility: 'Electricity',
        amount: 100,
        frequency: 'Monthly',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-09-01')
      },
      {
        selectedUtility: 'Water',
        amount: 50,
        frequency: 'Weekly',
        startDate: new Date('2025-08-15'),
        endDate: undefined
      }
    ];
  }

  selectUtility(utility: any) {
    this.recurringPaymentForm.get('selectedUtility')?.setValue(utility.name);
  }

  schedulePayment() {
    if (this.recurringPaymentForm.valid) {
      this.recurringPayments.push(this.recurringPaymentForm.value);
      this.recurringPaymentForm.reset();
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Payment scheduled successfully'});
    }
  }

  editPayment(payment: any) {
    this.selectedPayment = payment;
    this.editPaymentForm.patchValue(payment);
    this.displayEditDialog = true;
  }

  savePayment() {
    if (this.editPaymentForm.valid) {
      const index = this.recurringPayments.indexOf(this.selectedPayment);
      this.recurringPayments[index] = this.editPaymentForm.value;
      this.displayEditDialog = false;
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Payment updated successfully'});
    }
  }

  deletePayment(payment: any) {
    this.confirmationService.confirm({
        message: 'Are you sure that you want to delete this recurring payment?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            this.recurringPayments = this.recurringPayments.filter(p => p !== payment);
            this.messageService.add({severity:'success', summary: 'Success', detail: 'Payment deleted successfully'});
        }
    });
  }
}
