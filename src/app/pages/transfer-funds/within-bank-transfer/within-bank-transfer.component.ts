import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-within-bank-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './within-bank-transfer.component.html',
  styleUrl: './within-bank-transfer.component.scss'
})
export class WithinBankTransferComponent {
  recipientAccount: string = '';
  amount: number = 0;
  description: string = '';

  constructor() { }

  onSubmit() {
    // Handle the transfer logic here
    console.log('Within Bank Transfer Submitted:', {
      recipientAccount: this.recipientAccount,
      amount: this.amount,
      description: this.description
    });
    // You would typically call a service here to perform the actual transfer
    alert('Transfer initiated successfully!');
    this.resetForm();
  }

  resetForm() {
    this.recipientAccount = '';
    this.amount = 0;
    this.description = '';
  }
}