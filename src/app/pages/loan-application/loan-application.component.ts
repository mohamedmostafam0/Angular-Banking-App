import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SplitterModule } from 'primeng/splitter';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BankingDataService } from '../../services/banking-data.service';
import { Loan } from '../../interfaces/Loan.interface';
import { Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-loan-application',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    FileUploadModule,
    ButtonModule,
    ToastModule,
    SplitterModule,
    DropdownModule,
    ConfirmDialogModule
  ],
  templateUrl: './loan-application.component.html',
  styleUrls: ['./loan-application.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class LoanApplicationComponent implements OnInit {
  loanApplicationForm!: FormGroup;
  steps!: MenuItem[];
  activeIndex = 0;
  uploadedFiles: any[] = [];
  instructions: any[];
  loanPurposes: any[];
  supportedCurrencies: string[];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private bankingDataService: BankingDataService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.instructions = [
      { title: 'Personal Information', description: 'Please provide your personal details.' },
      { title: 'Employment Details', description: 'Please provide your employment information.' },
      { title: 'Loan Details', description: 'Please provide the details of the loan you are applying for.' },
      { title: 'Document Upload', description: 'Please upload the required documents in PDF format.' }
    ];

    this.loanPurposes = [
      { label: 'Personal Loan', value: 'personal' },
      { label: 'Home Loan', value: 'home' },
      { label: 'Car Loan', value: 'car' },
      { label: 'Business Loan', value: 'business' },
      { label: 'Other', value: 'other' }
    ];

    this.supportedCurrencies = ['USD' , 'EUR' , 'EGP' , 'AED' , 'SAR'];
  }
  ngOnInit() {
    this.loanApplicationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      employer: ['', Validators.required],
      income: [null, [Validators.required, Validators.min(0)]],
      amount: [null, [Validators.required, Validators.min(1000)]],
      currency: ['USD', Validators.required],
      purpose: [null, Validators.required],
      loanTerm: [null, [Validators.required, Validators.min(6)]],
      collateral: ['']
    });

    this.steps = [
      { label: 'Personal Information' },
      { label: 'Employment Details' },
      { label: 'Loan Details' },
      { label: 'Document Upload' }
    ];
  }

  nextStep() {
    if (this.isStepValid()) {
      this.activeIndex++;
    }
  }

  prevStep() {
    this.activeIndex--;
  }

  isStepValid(): boolean {
    switch (this.activeIndex) {
      case 0:
        return this.loanApplicationForm.get('name')!.valid && this.loanApplicationForm.get('email')!.valid && this.loanApplicationForm.get('phone')!.valid;
      case 1:
        return this.loanApplicationForm.get('employer')!.valid && this.loanApplicationForm.get('income')!.valid;
      case 2:
        return this.loanApplicationForm.get('amount')!.valid && this.loanApplicationForm.get('purpose')!.valid && this.loanApplicationForm.get('loanTerm')!.valid;
      default:
        return true;
    }
  }

  onUpload(event: any) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  onSubmit() {
    if (this.loanApplicationForm.valid) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to submit this loan application?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.submitApplication();
        }
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill in all required fields.' });
    }
  }

  submitApplication() {
    const newLoan: Loan = {
      id: this.createId(),
      status: this.activeIndex,
      ...this.loanApplicationForm.value
    };
    this.bankingDataService.saveLoanApplication(newLoan);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Loan application submitted successfully!' });
    this.router.navigate(['/loan-tracking'], { queryParams: { id: newLoan.id } });
  }

  createId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
