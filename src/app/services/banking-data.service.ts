import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../interfaces/Transaction.interface';
import { Account } from '../interfaces/Account.interface';


@Injectable({ providedIn: 'root' })
export class BankingDataService {
  private accountsSubject = new BehaviorSubject<Account[]>([
  { type: "Checking", number: "1000000001", balance: 1100.75, status: "Active" },
  { type: "Savings", number: "1000000002", balance: 1200.50, status: "Inactive" },
  { type: "Checking", number: "1000000003", balance: 1300.75, status: "Active" },
  { type: "Savings", number: "1000000004", balance: 1400.50, status: "Inactive" },
  { type: "Checking", number: "1000000005", balance: 1500.75, status: "Active" },
  { type: "Savings", number: "1000000006", balance: 1600.50, status: "Inactive" },
  { type: "Checking", number: "1000000007", balance: 1700.75, status: "Active" },
  { type: "Savings", number: "1000000008", balance: 1800.50, status: "Inactive" },
  { type: "Checking", number: "1000000009", balance: 1900.75, status: "Active" },
  { type: "Savings", number: "1000000010", balance: 2000.50, status: "Inactive" },
  { type: "Checking", number: "1000000011", balance: 2100.75, status: "Active" },
  { type: "Savings", number: "1000000012", balance: 2200.50, status: "Inactive" },
  { type: "Checking", number: "1000000013", balance: 2300.75, status: "Active" },
  { type: "Savings", number: "1000000014", balance: 2400.50, status: "Inactive" },
  { type: "Checking", number: "1000000015", balance: 2500.75, status: "Active" },
  { type: "Savings", number: "1000000016", balance: 2600.50, status: "Inactive" },
  { type: "Checking", number: "1000000017", balance: 2700.75, status: "Active" },
  { type: "Savings", number: "1000000018", balance: 2800.50, status: "Inactive" },
  { type: "Checking", number: "1000000019", balance: 2900.75, status: "Active" },
  { type: "Savings", number: "1000000020", balance: 3000.50, status: "Inactive" }
  ]);
  private transactionsSubject = new BehaviorSubject<Transaction[]>([
    { date: '2025-07-02', description: 'ATM Withdrawal', amount: -120.00, accountNumber: '1000000001' },
    { date: '2025-07-03', description: 'POS Purchase', amount: -45.23, accountNumber: '1000000002' },
    { date: '2025-07-04', description: 'Salary', amount: 3500.00, accountNumber: '1000000003' },
    { date: '2025-07-05', description: 'Online Transfer', amount: -250.00, accountNumber: '1000000004' },
    { date: '2025-07-06', description: 'Bill Payment', amount: -150.00, accountNumber: '1000000005' },
    { date: '2025-07-07', description: 'ATM Withdrawal', amount: -120.00, accountNumber: '1000000006' }
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
    const accounts = this.getAccounts().map(acc =>
      acc.number === accountNumber ? { ...acc, balance: acc.balance + amount } : acc
    );
    this.accountsSubject.next(accounts);
    this.addTransaction({
      date: new Date().toISOString().slice(0, 10),
      description: 'Deposit',
      amount,
      accountNumber
    });
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
      accountNumber
    });
    return true;
  }

  private addTransaction(tx: Transaction) {
    const transactions = [tx, ...this.getTransactions()];
    this.transactionsSubject.next(transactions);
    console.log('Transaction:', tx);
  }
}