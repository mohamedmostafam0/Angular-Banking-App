import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeModule, QRCodeComponent } from 'angularx-qrcode';
import { NgIf } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SplitterModule } from 'primeng/splitter';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { BankingDataService } from '../../services/banking-data.service';
import { Account } from '../../interfaces/Account.interface';

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
    InputTextModule,
    SplitterModule,
    DropdownModule,
    ToastModule
  ],
  templateUrl: './qr-code-payment.component.html',
  styleUrls: ['./qr-code-payment.component.scss']
})
export class QrCodePaymentComponent implements OnInit {
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transferType: 'Domestic' | 'International' = 'Domestic';
  qrdata: string = '';

  constructor(private bankingDataService: BankingDataService) {}

  ngOnInit() {
    this.accounts = this.bankingDataService.getAccounts();
  }

  generateQrCode() {
    if (this.selectedAccount) {
      const baseUrl = window.location.origin;
      let url = `${baseUrl}/#/transfer-funds/`;

      if (this.transferType === 'Domestic') {
        url += 'domestic';
      } else {
        url += 'international';
      }

      const params = new URLSearchParams();
      params.set('accountNumber', this.selectedAccount.number);
      params.set('currency', this.selectedAccount.currency);

      if (this.transferType === 'International') {
        params.set('iban', this.selectedAccount.iban!);
        params.set('swiftCode', this.selectedAccount.swiftCode!);
      }

      this.qrdata = `${url}?${params.toString()}`;
    }
  }

  async shareQrCode(qrCodeComponent: QRCodeComponent) {
    const canvas = qrCodeComponent.qrcElement.nativeElement.querySelector('canvas');
    if (!canvas) {
      console.error('QR Code canvas not found');
      return;
    }

    canvas.toBlob(async (blob: Blob | null) => {
      if (!blob) {
        console.error('Could not create blob from canvas');
        return;
      }

      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      const shareData = {
        files: [file],
        title: 'QR Code Payment',
        text: 'Scan this QR code to make a payment.',
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.error('Error sharing QR code:', err);
        }
      } else {
        // Fallback for browsers that do not support sharing
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'qr-code.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }, 'image/png');
  }
}
