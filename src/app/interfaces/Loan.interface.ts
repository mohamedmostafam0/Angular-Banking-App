export interface Loan {
  id: string;
  name: string;
  email: string;
  phone: string;
  employer: string;
  income: number;
  amount: number;
  currency: 'USD' | 'EUR' | 'EGP' | 'AED' | 'SAR';
  purpose: string;
  loanTerm: number;
  collateral: string;
  status: number; // This will be the activeIndex of the steps
}
