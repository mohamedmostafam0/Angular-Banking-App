import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { SplitterModule } from 'primeng/splitter';
import { ToastModule } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { BankingDataService } from '../../services/banking-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-new-payment',
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
    SplitterModule,
    ToastModule,
    CarouselModule,
    InputTextModule
  ],
  templateUrl: './add-new-payment.component.html',
  styleUrls: ['./add-new-payment.component.scss'],
  providers: [MessageService]
})
export class AddNewPaymentComponent implements OnInit {
  recurringPaymentForm: any;
  frequencies: any[] = [];
  utilities: any[] = [];
  currencies: any[] = [];
  responsiveOptions: any[];

  constructor(private fb: FormBuilder, private messageService: MessageService, private router: Router, private bankingDataService: BankingDataService) {
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
      currency: [null, Validators.required],
      frequency: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null]
    });

    this.frequencies = [
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' }
    ];

    this.currencies = this.bankingDataService.getSupportedCurrencies().map(c => ({ label: c, value: c }));

    this.utilities = [
      { name: 'Electricity', icon: 'pi-bolt' },
      { name: 'Internet', icon: 'pi-wifi' },
      { name: 'Phone', icon: 'pi-phone' },
      { name: 'Water', logo: '' },
      { name: 'Gas', logo: '' }
    ];
  }

  selectUtility(utility: any) {
    this.recurringPaymentForm.get('selectedUtility')?.setValue(utility.name);
  }

  schedulePayment() {
    if (this.recurringPaymentForm.valid) {
      this.bankingDataService.addRecurringPayment(this.recurringPaymentForm.value);
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Payment scheduled successfully'});
      setTimeout(() => {
        this.router.navigate(['/recurring-payments']);
      }, 1000);
    }
  }
}