export interface Account {
  number: string;
  type: string;
  balance: number;
  status: 'Active' | 'Inactive';
  currency: 'USD' | 'EUR' | 'EGP' | 'AED' | 'SAR';
  nickname?: string;
}
