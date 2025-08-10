import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { NgIf } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-qr-code-payment',
  standalone: true,
  imports: [
    FormsModule,
    QRCodeModule,
    NgIf,
    ToolbarModule,
    CardModule,
    InputNumberModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './qr-code-payment.component.html',
  styleUrl: './qr-code-payment.component.scss'
})
export class QrCodePaymentComponent {
  recipient: string = '';
  amount: number | null = null;
  qrdata: string = '';

  generateQrCode() {
    if (this.recipient && this.amount) {
      this.qrdata = `Recipient: ${this.recipient}, Amount: ${this.amount}`;
    }
  }
}
