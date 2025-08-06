import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
sections = [
    {
      title: 'Dashboard',
      items: [
        { label: 'Overview', route: '/dashboard/overview', icon: 'pi pi-home' }
      ]
    },
    {
      title: 'Accounts',
      items: [
        { label: 'All Accounts', route: '/accounts', icon: 'pi pi-wallet' },
        {
          label: 'Current Accounts',
          route: '/accounts',
          icon: 'pi pi-credit-card',
          queryParams: { type: 'Current' }
        },
        {
          label: 'Savings Accounts',
          route: '/accounts',
          icon: 'pi pi-dollar',
          queryParams: { type: 'Savings' }
        }
      ]
    },
    {
      title: 'Transactions',
      items: [
        { label: 'All Transactions', route: '/transactions', icon: 'pi pi-chart-bar' }
      ]
    },
    {
      title: 'Tools',
      items: [
        { label: 'Budget Planning', route: '/budget-planning', icon: 'pi pi-chart-pie' },
        { label: 'Schedule Reports', route: '/schedule-reports', icon: 'pi pi-calendar' },
        { label: 'Currency Converter', route: '/currency-converter', icon: 'pi pi-money-bill' }
      ]
    },
    {
      title: 'Account Operations',
      items: [
        { label: 'All Account Operations', route: '/account-operations', icon: 'pi pi-cog' },
        { label: 'Transfer Funds', route: '/account-operations/transfer', icon: 'pi pi-exchange' },
        {label: 'QR code payment', route: '/account-operations/qr-payment', icon: 'pi pi-qrcode' }
      ]
    }
  ];
}
