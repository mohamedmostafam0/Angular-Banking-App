export interface ScheduledReport {
  id: string;
  accountNumber: string;
  accountType: string;
  frequency: 'monthly';
  dayOfMonth: number;
}
