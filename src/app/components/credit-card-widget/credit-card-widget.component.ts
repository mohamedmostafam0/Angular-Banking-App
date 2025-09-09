import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { BankingDataService } from '../../services/banking-data.service';
import { CreditCard } from '../../interfaces/CreditCard.interface';
import { Observable, of } from 'rxjs';
import { CreditCardNumberPipe } from '../../pipes/credit-card-number.pipe';
import { UppercaseTextPipe } from '../../pipes/uppercase-text.pipe';

@Component({
  selector: 'app-credit-card-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, CardModule, TagModule, CreditCardNumberPipe, UppercaseTextPipe],
  templateUrl: './credit-card-widget.component.html',
  styleUrls: ['./credit-card-widget.component.scss']
})
export class CreditCardWidgetComponent implements OnInit {
  creditCards$: Observable<CreditCard[]> = of([]);
  selectedCreditCard: CreditCard | null = null;
  cardOptions: any[] = [];

  constructor(private bankingDataService: BankingDataService) {}

  ngOnInit(): void {
    this.creditCards$ = this.bankingDataService.creditCards$;
    this.creditCards$.subscribe(cards => {
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
      case 'Pending':
        return 'warn';
      case 'Inactive':
        return 'danger';
      default:
        return 'info';
    }
  }

  onCardChange(event: any): void {
    this.selectedCreditCard = event.value;
  }
}
