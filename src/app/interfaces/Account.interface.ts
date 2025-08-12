export interface Account {
  number: string;
  type: string;
  balance: number;
  status: 'Active' | 'Inactive';
  currency: 'USD' | 'EUR' | 'EGP' | 'AED' | 'SAR';
  iban: string;
  swiftCode: string;
  nickname?: string;
  alerts?: {
    lowBalance?: {
      enabled: boolean;
      threshold: number;
    };
    largeTransaction?: {
      enabled: boolean;
      threshold: number;
    };
  };
}
