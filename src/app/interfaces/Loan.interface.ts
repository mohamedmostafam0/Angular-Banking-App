export interface Loan {
  id: string;
  status: number; // This will be the activeIndex of the steps
  loanType: string;
  program: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'EGP' | 'AED' | 'SAR';
  tenor: number;
  mobileNumber: string;
  nationalId: string;
  city: string;
  email: string;
  branch: string;
  documents: any[];
  agreeToTerms: boolean;
  employmentStatus: string;
  companyName: string;
  companyAddress: string;
  professionCategory: string;
  hiringDate: Date;
  salaryTransferType: string;
  monthlyIncome: number;
}
