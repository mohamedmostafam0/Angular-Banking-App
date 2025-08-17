import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'creditCardNumber',
  standalone: true
})
export class CreditCardNumberPipe implements PipeTransform {
  transform(cardNumber: string): string {
    if (!cardNumber) {
      return '';
    }
    // Add a space every 4 digits
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }
}
