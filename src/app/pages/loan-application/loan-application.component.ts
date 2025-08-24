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
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

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
    ConfirmDialogModule,
    CheckboxModule,
    CalendarModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './loan-application.component.html',
  styleUrls: ['./loan-application.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class LoanApplicationComponent implements OnInit {
  loanApplicationForm!: FormGroup;
  
  activeIndex = 0;
  uploadedFiles: any[] = [];
  instructions: any[];
  paperworkChoice: string | null = null;
  
  egyptianCities: any[];
  branches: any[];
  employmentStatusOptions: any[];
  professionCategoryOptions: any[];
  salaryTransferTypeOptions: any[];
  loanTypes: any[];
  programs: any[];
  tenors: any[];
  currencies: any[];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private bankingDataService: BankingDataService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.instructions = [
      { label: 'Loan Details', title: 'Loan Details', description: 'Please provide the details of the loan you are applying for.' },
      { label: 'Document Upload', title: 'Document Upload', description: "In this step we'll use your camera to scan your National ID, and on a later step we'll use your front camera to capture selfie photo, please prepare your national ID and follow the below instructions." },
      { label: 'Eligibility', title: 'Eligibility', description: 'Congratulations! Your request has been initially approved for Platinum Card' },
      { label: 'Paperwork Details', title: 'Paperwork Details', description: 'Choose how to submit your paperwork.' },
      { label: 'Confirmation', title: 'Confirmation', description: 'Please review your application details before submitting.' }
    ];
    

    this.loanTypes = [
      { label: 'Personal Loan', value: 'personal' },
      { label: 'Car Loan', value: 'car' },
      { label: 'Home Loan', value: 'home' }
    ];

    this.programs = [
      { label: 'Standard Program', value: 'standard' },
      { label: 'Premium Program', value: 'premium' }
    ];

    this.tenors = [
      { label: '6 Months', value: 6 },
      { label: '12 Months', value: 12 },
      { label: '24 Months', value: 24 },
      { label: '36 Months', value: 36 },
      { label: '48 Months', value: 48 },
      { label: '60 Months', value: 60 }
    ];

    this.currencies = this.bankingDataService.getSupportedCurrencies().map(c => ({ label: c, value: c }));

    this.egyptianCities = [];

  this.branches = [
    { label: 'Main Branch', value: 'main' },
    { label: 'Downtown Branch', value: 'downtown' },
    { label: 'Heliopolis Branch', value: 'heliopolis' },
    { label: 'Nasr City Branch', value: 'nasr_city' },
    { label: 'Maadi Branch', value: 'maadi' }
];

this.employmentStatusOptions = [];

this.professionCategoryOptions = [];

this.salaryTransferTypeOptions = [];
  }
  ngOnInit() {
    this.loanApplicationForm = this.fb.group({
      loanType: [null, Validators.required],
      program: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      currency: [null, Validators.required],
      tenor: [null, Validators.required],
      documents: [null, Validators.required],
      agreeToTerms: [false, Validators.requiredTrue],
      visitAddress: [''],
      visitDate: [null],
      paperworkBranch: [null]
    });

    
  }

  nextStep() {
    if (this.isStepValid()) {
      this.activeIndex++;
    }
  }

  prevStep() {
    this.activeIndex--;
  }

  selectPaperworkOption(option: string) {
    this.paperworkChoice = option;
    if (option === 'branch') {
      this.loanApplicationForm.get('visitAddress')!.clearValidators();
      this.loanApplicationForm.get('visitDate')!.clearValidators();
      this.loanApplicationForm.get('paperworkBranch')!.setValidators([Validators.required]);
    } else if (option === 'home') {
      this.loanApplicationForm.get('paperworkBranch')!.clearValidators();
      this.loanApplicationForm.get('visitAddress')!.setValidators([Validators.required]);
      this.loanApplicationForm.get('visitDate')!.setValidators([Validators.required]);
    }
    this.loanApplicationForm.get('visitAddress')!.updateValueAndValidity();
    this.loanApplicationForm.get('visitDate')!.updateValueAndValidity();
    this.loanApplicationForm.get('paperworkBranch')!.updateValueAndValidity();
  }

  isStepValid(): boolean {
    switch (this.activeIndex) {
      case 0:
        return this.loanApplicationForm.get('loanType')!.valid && this.loanApplicationForm.get('program')!.valid && this.loanApplicationForm.get('amount')!.valid && this.loanApplicationForm.get('currency')!.valid && this.loanApplicationForm.get('tenor')!.valid;
      case 1:
        return this.loanApplicationForm.get('documents')!.valid;
      case 2:
        return true;
      case 3:
        if (this.paperworkChoice === 'branch') {
          return this.loanApplicationForm.get('paperworkBranch')!.valid;
        } else if (this.paperworkChoice === 'home') {
          return this.loanApplicationForm.get('visitAddress')!.valid && this.loanApplicationForm.get('visitDate')!.valid;
        }
        return false;
      case 4:
        return this.loanApplicationForm.get('agreeToTerms')!.valid;
      default:
        return true;
    }
  }

  onUpload(event: any) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.loanApplicationForm.patchValue({ documents: this.uploadedFiles });
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
