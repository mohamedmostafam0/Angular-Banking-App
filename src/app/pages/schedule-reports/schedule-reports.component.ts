import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BankingDataService } from '../../services/banking-data.service';
import { Observable, of, Subscription } from 'rxjs';
import { Account } from '../../interfaces/Account.interface';
import { Transaction } from '../../interfaces/Transaction.interface';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-schedule-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ChartModule,
    DropdownModule,
    InputNumberModule,
    ToastModule
  ],
  templateUrl: './schedule-reports.component.html',
  styleUrls: ['./schedule-reports.component.scss'],
  providers: [MessageService]
})
export class ScheduleReportsComponent implements OnInit, OnDestroy {
  @ViewChild('spendingByCategoryChart') spendingByCategoryChartRef!: ElementRef;
  @ViewChild('balanceTrendChart') balanceTrendChartRef!: ElementRef;
  @ViewChild('cashflowChart') cashflowChartRef!: ElementRef;
  

  // Chart data
  spendingByCategoryData: any;
  balanceTrendData: any;
  cashflowData: any;

  // Reporting
  selectedReportAccount: string | null = null;
  reportDay: number = 1;
  accountOptions: any[] = [];
  
  private transactionsSubscription: Subscription | undefined;
  private accountsSubscription: Subscription | undefined;

  constructor(
    private bankingDataService: BankingDataService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.accountsSubscription = this.bankingDataService.accounts$.subscribe(data => {
      this.accountOptions = [
        { label: 'All Accounts', value: null },
        ...data.map(acc => ({ label: acc.number, value: acc.number }))
      ];
    });

    this.transactionsSubscription = this.bankingDataService.transactions$.subscribe(data => {
      this.prepareChartData(data);
    });
  }

  prepareChartData(transactions: Transaction[]) {
    let filteredTransactions = transactions;
    if (this.selectedReportAccount) {
      filteredTransactions = transactions.filter(t => t.accountNumber === this.selectedReportAccount);
    }

    // Spending by Category
    const categories = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const category = t.description;
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as { [key: string]: number });

    this.spendingByCategoryData = {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }
      ]
    };

    // Balance Trend
    const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = 0;
    const balanceData = sortedTransactions.map(t => {
      balance += t.amount;
      return { x: new Date(t.date), y: balance };
    });

    this.balanceTrendData = {
      labels: balanceData.map(d => d.x.toLocaleDateString()),
      datasets: [
        {
          label: 'Balance',
          data: balanceData.map(d => d.y),
          fill: true,
          borderColor: '#42A5F5',
          tension: .4
        }
      ]
    };

    // Cashflow Waterfall
    const income = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);

    this.cashflowData = {
      labels: ['Income', 'Expenses', 'Net Cashflow'],
      datasets: [
        {
          label: 'Amount',
          backgroundColor: ['#4CAF50', '#F44336', '#2196F3'],
          data: [income, Math.abs(expenses), income + expenses]
        }
      ]
    };
  }

  onAccountChange(event: any) {
    this.selectedReportAccount = event.value;
    this.bankingDataService.transactions$.subscribe(data => {
      this.prepareChartData(data);
    });
  }

  scheduleReport() {
    if (!this.selectedReportAccount) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an account for the report.' });
      return;
    }

    this.messageService.add({ severity: 'info', summary: 'Generating Report', detail: 'Please wait while your PDF report is being generated...' });

    // Ensure charts have rendered before capturing
    setTimeout(async () => {
      const doc = new jsPDF();
      let yOffset = 10;

      // Helper to add text section
      const addTextSection = (title: string, content: string[]) => {
        doc.setFontSize(14);
        doc.text(title, 10, yOffset);
        yOffset += 8;
        doc.setFontSize(10);
        content.forEach(line => {
          doc.text(line, 15, yOffset);
          yOffset += 6;
        });
        yOffset += 10;
      };

      // Helper to add chart image
      const addChartToPdf = async (chartElement: ElementRef, title: string) => {
        if (chartElement && chartElement.nativeElement) {
          const canvas = await html2canvas(chartElement.nativeElement);
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 180;
          const pageHeight = doc.internal.pageSize.height;
          const imgHeight = canvas.height * imgWidth / canvas.width;

          // Check if new page is needed
          if (yOffset + imgHeight > pageHeight - 20) {
            doc.addPage();
            yOffset = 10;
          }

          doc.setFontSize(14);
          doc.text(title, 10, yOffset);
          yOffset += 8;
          doc.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
          yOffset += imgHeight + 10;
        }
      };

      // Report Header
      doc.setFontSize(18);
      doc.text(`Banking Report for Account: ${this.selectedReportAccount}`, 10, yOffset);
      yOffset += 10;
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, yOffset);
      yOffset += 20;

      // Add Spending by Category (Textual)
      if (this.spendingByCategoryData && this.spendingByCategoryData.labels.length > 0) {
        const categoryLines = this.spendingByCategoryData.labels.map((label: string, index: number) => {
          return `${label}: ${this.spendingByCategoryData.datasets[0].data[index]}`;
        });
        addTextSection('Spending by Category (Summary)', categoryLines);
      }

      // Add Spending by Category (Chart)
      if (this.spendingByCategoryChartRef) {
        await addChartToPdf(this.spendingByCategoryChartRef, 'Spending by Category (Chart)');
      }

      // Add Balance Trend (Textual - simplified)
      if (this.balanceTrendData && this.balanceTrendData.labels.length > 0) {
        const balanceLines: string[] = [];
        const displayCount = Math.min(5, this.balanceTrendData.labels.length);
        for (let i = 0; i < displayCount; i++) {
          balanceLines.push(`${this.balanceTrendData.labels[i]}: ${this.balanceTrendData.datasets[0].data[i]}`);
        }
        addTextSection('Balance Trend (Summary - Last 5 Entries)', balanceLines);
      }

      // Add Balance Trend (Chart)
      if (this.balanceTrendChartRef) {
        await addChartToPdf(this.balanceTrendChartRef, 'Balance Trend (Chart)');
      }

      // Add Cashflow Waterfall (Textual)
      if (this.cashflowData && this.cashflowData.labels.length > 0) {
        const cashflowLines = this.cashflowData.labels.map((label: string, index: number) => {
          return `${label}: ${this.cashflowData.datasets[0].data[index]}`;
        });
        addTextSection('Cash-flow Summary', cashflowLines);
      }

      // Add Cashflow Waterfall (Chart)
      if (this.cashflowChartRef) {
        await addChartToPdf(this.cashflowChartRef, 'Cash-flow Waterfall (Chart)');
      }

      doc.save(`Banking_Report_${this.selectedReportAccount}_${new Date().toISOString().slice(0, 10)}.pdf`);
      this.messageService.add({ severity: 'success', summary: 'Report Generated', detail: 'Your PDF report has been successfully generated.' });
    }, 500); // 500ms delay to ensure charts are rendered
  }

  ngOnDestroy(): void {
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
    if (this.accountsSubscription) {
      this.accountsSubscription.unsubscribe();
    }
  }
}
