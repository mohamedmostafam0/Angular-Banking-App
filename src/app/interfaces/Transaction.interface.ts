export type TransactionType = 
  | 'Deposit'
  | 'Withdrawal'
  | 'Within-Bank Transfer'
  | 'Domestic Transfer'
  | 'International Transfer'
  | 'Salary'
  | 'Groceries'
  | 'Rent'
  | 'Online Shopping'
  | 'Utility Bill'
  | 'Restaurant'
  | 'Freelance Payment'
  | 'Stock Dividend'
  | 'Gift'
  | 'Refund';

export interface Transaction {
  date: string;
  description: TransactionType;
  amount: number;
  accountNumber: string;
  currency: 'USD' | 'EUR' | 'EGP' | 'AED' | 'SAR';
}
