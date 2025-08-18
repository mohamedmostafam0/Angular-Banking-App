import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uppercaseText',
  standalone: true
})
export class UppercaseTextPipe implements PipeTransform {
  transform(value: string): string {
    return value ? value.toUpperCase() : '';
  }
}
