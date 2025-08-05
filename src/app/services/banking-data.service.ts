import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../interfaces/Transaction.interface';
import { ScheduledReport } from '../interfaces/ScheduledReport.interface';
import { Account } from '../interfaces/Account.interface';
import { MessageService } from 'primeng/api';
import { environment } from '../../environments/environment';

interface CachedRates {
  timestamp: number;
  rates: { [key: string]: number };
}

interface ExchangeRatesResponse {
  rates: { [key: string]: number };
  base: string;
  date: string;
}

type ExchangeRates = { [key: string]: number };

@Injectable({ providedIn: 'root' })
export class BankingDataService {
  private readonly ACCOUNTS_KEY = 'banking_accounts';
  private readonly TRANSACTIONS_KEY = 'banking_transactions';
  private readonly REPORTS_KEY = 'banking_scheduled_reports';

  private accountsSubject = new BehaviorSubject<Account[]>([]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private scheduledReportsSubject = new BehaviorSubject<ScheduledReport[]>([]);

  accounts$ = this.accountsSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();
  scheduledReports$ = this.scheduledReportsSubject.asObservable();

  private apiKey = environment.openExchangeRatesApiKey;
  private baseUrl = environment.openExchangeRatesApiUrl;
  private ratesSubject = new BehaviorSubject<ExchangeRates | null>(null);
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CACHE_KEY = 'cached_exchange_rates';
  readonly supportedCurrencies = ['USD', 'EUR', 'EGP', 'AED', 'SAR'];

  constructor(private messageService: MessageService, private http: HttpClient) {
    this.loadData();
    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      this.ratesSubject.next(cachedRates.rates);
    }
  }

  // --- Data Loading and Persistence ---

  private loadData() {
    this.loadAccounts();
    this.loadTransactions();
    this.loadScheduledReports();
  }

  private loadAccounts() {
    const savedAccounts = localStorage.getItem(this.ACCOUNTS_KEY);
    if (savedAccounts) {
      this.accountsSubject.next(JSON.parse(savedAccounts));
    } else {
      const initialAccounts: Account[] = [
        { type: "Current", number: "1000000001", balance: 1100.75, status: "Active", currency: 'USD' },
        { type: "Savings", number: "1000000002", balance: 1200.50, status: "Active", currency: 'EUR' },
        { type: "Savings", number: "1000000004", balance: 1400.50, status: "Active", currency: 'AED' },
        { type: "Current", number: "1000000013", balance: 2300.75, status: "Active", currency: 'EGP' },
        { type: "Savings", number: "1000000016", balance: 2600.50, status: "Active", currency: 'USD' },
        { type: "Current", number: "1000000017", balance: 2700.75, status: "Active", currency: 'EUR' },
        { type: "Savings", number: "1000000014", balance: 2400.50, status: "Active", currency: 'AED' },
        { type: "Savings", number: "1000000018", balance: 2800.50, status: "Inactive", currency: 'EGP' }
      ];
      this.accountsSubject.next(initialAccounts);
      this.saveAccounts();
    }
  }

  private saveAccounts() {
    localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(this.accountsSubject.getValue()));
  }

  private loadTransactions() {
    const savedTransactions = localStorage.getItem(this.TRANSACTIONS_KEY);
    if (savedTransactions) {
      this.transactionsSubject.next(JSON.parse(savedTransactions));
    } else {
      const initialTransactions: Transaction[] = [
        { date: '2025-07-02', description: 'Groceries', amount: -120.00, accountNumber: '1000000001', currency: 'USD' },
        { date: '2025-07-03', description: 'Restaurant', amount: -45.23, accountNumber: '1000000002', currency: 'EUR' },
        { date: '2025-07-04', description: 'Salary', amount: 3500.00, accountNumber: '1000000001', currency: 'USD' },
      ];
      this.transactionsSubject.next(initialTransactions);
      this.saveTransactions();
    }
  }

  private saveTransactions() {
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(this.transactionsSubject.getValue()));
  }

  private loadScheduledReports() {
    const savedReports = localStorage.getItem(this.REPORTS_KEY);
    if (savedReports) {
      this.scheduledReportsSubject.next(JSON.parse(savedReports));
    } else {
      this.scheduledReportsSubject.next([]);
    }
  }

  private saveScheduledReports() {
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(this.scheduledReportsSubject.getValue()));
  }

  // --- Account and Transaction Methods ---

  getRecentTransactionsForAccount(accountNumber: string): Transaction[] {
    return this.transactionsSubject.value
      .filter(tx => tx.accountNumber === accountNumber)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  getTransactionsByDateRange(accountNumber: string, startDate: Date, endDate: Date): (Transaction & { balance: number })[] {
    const account = this.getAccounts().find(acc => acc.number === accountNumber);
    if (!account) return [];

    const allTransactions = this.transactionsSubject.value
      .filter(tx => tx.accountNumber === accountNumber)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentBalance = account.balance;
    const transactionsWithBalance: (Transaction & { balance: number })[] = [];

    for (let i = allTransactions.length - 1; i >= 0; i--) {
      const tx = allTransactions[i];
      const txDate = new Date(tx.date);
      if (txDate >= startDate && txDate <= endDate) {
        transactionsWithBalance.unshift({ ...tx, balance: currentBalance });
      }
      currentBalance -= tx.amount;
    }

    return transactionsWithBalance;
  }

  getAccounts() {
    return this.accountsSubject.getValue();
  }

  getTransactions() {
    return this.transactionsSubject.getValue();
  }

  deposit(accountNumber: string, amount: number) {
    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.number === accountNumber);
    
    if (!account) {
      console.error('Account not found:', accountNumber);
      return false;
    }
    
    const updatedAccounts = accounts.map(acc =>
      acc.number === accountNumber ? { ...acc, balance: acc.balance + amount } : acc
    );
    
    this.accountsSubject.next(updatedAccounts);
    this.checkAlerts(accountNumber, account.balance + amount, amount);
    
    this.addTransaction({
      date: new Date().toISOString().slice(0, 10),
      description: 'Deposit',
      amount,
      accountNumber,
      currency: account.currency
    });
    
    return true;
  }

  withdraw(accountNumber: string, amount: number): boolean {
    const accounts = this.getAccounts();
    const acc = accounts.find(a => a.number === accountNumber);
    if (!acc || acc.balance < amount) return false;
    const updatedBalance = acc.balance - amount;
    const updatedAccounts = accounts.map(a =>
      a.number === accountNumber ? { ...a, balance: updatedBalance } : a
    );
    this.accountsSubject.next(updatedAccounts);
    this.addTransaction({
      date: new Date().toISOString().slice(0, 10),
      description: 'Withdrawal',
      amount: -amount,
      accountNumber,
      currency: acc.currency
    });
    this.checkAlerts(accountNumber, updatedBalance, amount);
    return true;
  }

  private addTransaction(tx: Transaction) {
    const transactions = [tx, ...this.getTransactions()];
    this.transactionsSubject.next(transactions);
    this.saveTransactions();
    console.log('Transaction:', tx);
  }

  updateAccount(updatedAccount: Account) {
    const accounts = this.getAccounts().map(account => 
      account.number === updatedAccount.number ? updatedAccount : account
    );
    this.accountsSubject.next(accounts);
    this.saveAccounts();
  }

  // --- Alert Methods ---

  setLowBalanceAlert(accountNumber: string, threshold: number) {
    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.number === accountNumber);
    if (account) {
      account.alerts = {
        ...account.alerts,
        lowBalance: {
          enabled: true,
          threshold
        }
      };
      this.updateAccount(account);
    }
  }

  setLargeTransactionAlert(accountNumber: string, threshold: number) {
    const accounts = this.getAccounts();
    const account = accounts.find(acc => acc.number === accountNumber);
    if (account) {
      account.alerts = {
        ...account.alerts,
        largeTransaction: {
          enabled: true,
          threshold
        }
      };
      this.updateAccount(account);
    }
  }

  private checkAlerts(accountNumber: string, newBalance: number, transactionAmount: number) {
    const account = this.getAccounts().find(acc => acc.number === accountNumber);
    if (!account || !account.alerts) return;

    if (account.alerts.lowBalance?.enabled && newBalance < account.alerts.lowBalance.threshold) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Low Balance Alert',
        detail: `The balance for account ${accountNumber} is below the threshold of ${account.alerts.lowBalance.threshold}.`,
        life: 10000
      });
    }

    if (account.alerts.largeTransaction?.enabled && Math.abs(transactionAmount) > account.alerts.largeTransaction.threshold) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Large Transaction Alert',
        detail: `A transaction of ${Math.abs(transactionAmount)} on account ${accountNumber} exceeded the threshold of ${account.alerts.largeTransaction.threshold}.`,
        life: 10000
      });
    }
  }

  // --- Scheduled Reports Methods ---

  getScheduledReports(): ScheduledReport[] {
    return this.scheduledReportsSubject.getValue();
  }

  addScheduledReport(report: Omit<ScheduledReport, 'id'>) {
    const newReport: ScheduledReport = {
      ...report,
      id: new Date().toISOString() + Math.random().toString().slice(2, 8),
    };
    const reports = [...this.getScheduledReports(), newReport];
    this.scheduledReportsSubject.next(reports);
    this.saveScheduledReports();
  }

  deleteScheduledReport(reportId: string) {
    const reports = this.getScheduledReports().filter(r => r.id !== reportId);
    this.scheduledReportsSubject.next(reports);
    this.saveScheduledReports();
  }

  // --- Exchange Rate Methods ---

  private fetchExchangeRates(): Observable<ExchangeRates> {
    const now = Date.now();
    const cachedRates = this.getCachedRates();
    if (cachedRates && now - cachedRates.timestamp < this.CACHE_DURATION) {
      this.ratesSubject.next(cachedRates.rates);
      return of(cachedRates.rates);
    }

    const url = `${this.baseUrl}?app_id=${this.apiKey}&base=USD&symbols=${this.supportedCurrencies.join(',')}`;
    
    return this.http.get<ExchangeRatesResponse>(url).pipe(
      map(response => {
        if (response && response.rates) {
          this.lastFetchTime = now;
          const rates: ExchangeRates = {};
          this.supportedCurrencies.forEach(currency => {
            rates[currency] = response.rates[currency] || 0;
          });
          this.ratesSubject.next(rates);
          this.saveRatesToStorage(rates);
          return rates;
        }
        throw new Error('Invalid response from exchange rate API');
      }),
      catchError(error => {
        console.error('Error fetching exchange rates:', error);
        if (cachedRates) {
          this.ratesSubject.next(cachedRates.rates);
          return of(cachedRates.rates);
        }
        const defaultRates: ExchangeRates = {};
        this.supportedCurrencies.forEach(currency => {
          defaultRates[currency] = 1;
        });
        return of(defaultRates);
      })
    );
  }

  getExchangeRates(currencies: string[]): Observable<ExchangeRates> {
    if (!currencies || currencies.length === 0) {
      return of({});
    }

    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      const result: ExchangeRates = {};
      currencies.forEach(currency => {
        result[currency] = cachedRates.rates[currency] || 1;
      });
      return of(result);
    }

    return this.fetchExchangeRates().pipe(
      map(rates => {
        const result: ExchangeRates = {};
        currencies.forEach(currency => {
          result[currency] = rates[currency] || 1;
        });
        return result;
      }),
      catchError(error => {
        console.error('Error fetching exchange rates:', error);
        const defaultRates: ExchangeRates = {};
        currencies.forEach(currency => {
          defaultRates[currency] = 1;
        });
        return of(defaultRates);
      })
    );
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): Observable<number> {
    if (fromCurrency === toCurrency) {
      return of(amount);
    }

    const cachedRates = this.getCachedRates();
    if (cachedRates) {
      const fromRate = cachedRates.rates[fromCurrency] || 1;
      const toRate = cachedRates.rates[toCurrency] || 1;
      const convertedAmount = (amount / fromRate) * toRate;
      return of(parseFloat(convertedAmount.toFixed(6)));
    }

    return this.fetchExchangeRates().pipe(
      map(rates => {
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[toCurrency] || 1;
        const convertedAmount = (amount / fromRate) * toRate;
        return parseFloat(convertedAmount.toFixed(6));
      })
    );
  }

  getSupportedCurrencies(): string[] {
    return [...this.supportedCurrencies];
  }

  private getCachedRates(): CachedRates | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) {
        return null;
      }
      const { rates, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < this.CACHE_DURATION) {
        return { rates, timestamp };
      }
      return null;
    } catch (e) {
      console.error('Error reading cached rates:', e);
      return null;
    }
  }

  private saveRatesToStorage(rates: ExchangeRates) {
    try {
      const dataToCache: CachedRates = {
        rates,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(dataToCache));
    } catch (e) {
      console.error('Error saving rates to storage:', e);
    }
  }

  // Add other methods as needed
}
