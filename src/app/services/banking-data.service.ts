import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../interfaces/Transaction.interface';
import { Account } from '../interfaces/Account.interface';


@Injectable({ providedIn: 'root' })
export class BankingDataService {
  private accountsSubject = new BehaviorSubject<Account[]>([
  { type: "Checking", number: "1000000001", balance: 1100.75, status: "Active", currency: 'USD' },
  { type: "Savings", number: "1000000002", balance: 1200.50, status: "Inactive", currency: 'EUR' },
  { type: "Savings", number: "1000000004", balance: 1400.50, status: "Inactive", currency: 'AED' },
  { type: "Checking", number: "1000000013", balance: 2300.75, status: "Active", currency: 'EGP' },
  { type: "Savings", number: "1000000016", balance: 2600.50, status: "Inactive", currency: 'USD' },
  { type: "Checking", number: "1000000017", balance: 2700.75, status: "Active", currency: 'EUR' },
  { type: "Savings", number: "1000000014", balance: 2400.50, status: "Inactive", currency: 'AED' },
  { type: "Savings", number: "1000000018", balance: 2800.50, status: "Inactive", currency: 'EGP' }
  ]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([
    { date: '2025-07-02', description: 'ATM Withdrawal', amount: -120.00, accountNumber: '1000000001', currency: 'USD' },
    { date: '2025-07-03', description: 'POS Purchase', amount: -45.23, accountNumber: '1000000002', currency: 'EUR' },
    { date: '2025-07-04', description: 'Salary', amount: 3500.00, accountNumber: '1000000003', currency: 'EGP' },
    { date: '2025-07-05', description: 'Online Transfer', amount: -250.00, accountNumber: '1000000004', currency: 'AED' },
    { date: '2025-07-06', description: 'Bill Payment', amount: -150.00, accountNumber: '1000000005', currency: 'SAR' },
    { date: '2025-07-07', description: 'ATM Withdrawal', amount: -120.00, accountNumber: '1000000006', currency: 'USD' },
    { date: '2025-07-03', description: 'POS Purchase', amount: -45.23, accountNumber: '1000000022', currency: 'USD' },
    { date: '2025-07-04', description: 'Salary', amount: 3500.00, accountNumber: '1000000023', currency: 'EUR' },
    { date: '2025-07-05', description: 'Online Transfer', amount: -250.00, accountNumber: '1000000024', currency: 'EGP' },
    { date: '2025-07-06', description: 'Bill Payment', amount: -150.00, accountNumber: '1000000025', currency: 'AED' },
    { date: '2025-07-07', description: 'ATM Withdrawal', amount: -120.00, accountNumber: '1000000026', currency: 'SAR' },
    { date: '2025-07-08', description: 'POS Purchase', amount: -45.23, accountNumber: '1000000027', currency: 'USD' },
    { date: '2025-07-09', description: 'Salary', amount: 3500.00, accountNumber: '1000000028', currency: 'EUR' },
    { date: '2025-07-10', description: 'Online Transfer', amount: -250.00, accountNumber: '1000000029', currency: 'EGP' },
    { date: '2025-07-11', description: 'Bill Payment', amount: -150.00, accountNumber: '1000000030', currency: 'AED' },
    { date: '2025-07-12', description: 'ATM Withdrawal', amount: -120.00, accountNumber: '1000000031', currency: 'SAR' },
    { date: '2025-07-13', description: 'POS Purchase', amount: -45.23, accountNumber: '1000000032', currency: 'USD' },
    { date: '2025-07-14', description: 'Salary', amount: 3500.00, accountNumber: '1000000033', currency: 'EUR' },
    { date: '2025-07-15', description: 'Online Transfer', amount: -250.00, accountNumber: '1000000034', currency: 'EGP' },
    { date: '2025-07-16', description: 'Bill Payment', amount: -150.00, accountNumber: '1000000035', currency: 'AED' },
    { date: '2025-07-17', description: 'ATM Withdrawal', amount: -120.00, accountNumber: '1000000036', currency: 'SAR' },
    { date: '2025-07-18', description: 'POS Purchase', amount: -45.23, accountNumber: '1000000037', currency: 'USD' },
    { date: '2025-07-19', description: 'Salary', amount: 3500.00, accountNumber: '1000000038', currency: 'EUR' },
    { date: '2025-07-20', description: 'Online Transfer', amount: -250.00, accountNumber: '1000000039', currency: 'EGP' },
    { date: '2025-07-01', description: 'Bill Payment', amount: -150.00, accountNumber: '1000000040', currency: 'AED' }
  ]);

  accounts$ = this.accountsSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();

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
    const updatedAccounts = accounts.map(a =>
      a.number === accountNumber ? { ...a, balance: a.balance - amount } : a
    );
    this.accountsSubject.next(updatedAccounts);
    this.addTransaction({
      date: new Date().toISOString().slice(0, 10),
      description: 'Withdrawal',
      amount: -amount,
      accountNumber,
      currency: acc.currency
    });
    return true;
  }

  private addTransaction(tx: Transaction) {
    const transactions = [tx, ...this.getTransactions()];
    this.transactionsSubject.next(transactions);
    console.log('Transaction:', tx);
  }

  updateAccount(updatedAccount: Account) {
    const accounts = this.getAccounts().map(account => 
      account.number === updatedAccount.number ? updatedAccount : account
    );
    this.accountsSubject.next(accounts);
  }
}