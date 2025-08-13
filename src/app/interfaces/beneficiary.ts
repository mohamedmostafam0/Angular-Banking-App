export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankBranchName?: string;
  bankBranchCode?: string;
  accountCurrency: string;
  group: 'Family' | 'Business' | 'Other';
  isFavorite: boolean;
  isInternational: boolean;
  swiftCode?: string;
  iban?: string;
  bankAddress?: string;
  beneficiaryAddress?: string;
  beneficiaryCountry?: string;
  purposeNickname?: string;
  purposeOfPayment?: string;
}
