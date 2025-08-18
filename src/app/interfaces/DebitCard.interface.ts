export interface DebitCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expirationDate: string; // MM/YY
  cvv: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  dailyLimit: number;
  linkedAccountNumber: string;
}
