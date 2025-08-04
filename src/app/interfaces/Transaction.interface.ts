export interface Transaction {
  date: string;
  description: string;
  amount: number;
  accountNumber: string;
  currency: 'USD' | 'EUR' | 'EGP' | 'AED' | 'SAR';
}
