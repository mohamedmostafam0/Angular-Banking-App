import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BankingDataService } from '../../services/banking-data.service';
import { DebitCard } from '../../interfaces/DebitCard.interface';
import { Observable, of } from 'rxjs';
import { CreditCardNumberPipe } from '../../pipes/credit-card-number.pipe';
import { UppercaseTextPipe } from '../../pipes/uppercase-text.pipe';

@Component({
  selector: 'app-debit-card-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, CardModule, TagModule, CreditCardNumberPipe, UppercaseTextPipe],
  templateUrl: './debit-card-widget.component.html',
  styleUrls: ['./debit-card-widget.component.scss']
})
export class DebitCardWidgetComponent implements OnInit {
  debitCards$: Observable<DebitCard[]> = of([]);
  selectedDebitCard: DebitCard | null = null;
  cardOptions: any[] = [];

  constructor(private bankingDataService: BankingDataService) {}

  ngOnInit(): void {
    this.debitCards$ = this.bankingDataService.debitCards$;
    this.debitCards$.subscribe(cards => {
      this.cardOptions = cards.map(card => ({
        label: card.cardNumber,
        value: card
      }));
    });
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'danger';
      case 'Blocked':
        return 'warn';
      default:
        return 'info';
    }
  }

  onCardChange(event: any): void {
    this.selectedDebitCard = event.value;
  }
}
