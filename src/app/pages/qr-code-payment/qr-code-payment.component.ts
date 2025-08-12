import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { NgIf } from '@angular/common';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SplitterModule } from 'primeng/splitter';
import { DropdownModule } from 'primeng/dropdown';
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
    DropdownModule
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
      let url = `${baseUrl}/transfer-funds/`;

      if (this.transferType === 'Domestic') {
        url += 'domestic-transfer';
      } else {
        url += 'international-transfer';
      }

      const params = new URLSearchParams();
      params.set('accountNumber', this.selectedAccount.number);
      params.set('currency', this.selectedAccount.currency);

      if (this.transferType === 'International') {
        params.set('iban', this.selectedAccount.iban);
        params.set('swiftCode', this.selectedAccount.swiftCode);
      }

      this.qrdata = `${url}?${params.toString()}`;
    }
  }
}
