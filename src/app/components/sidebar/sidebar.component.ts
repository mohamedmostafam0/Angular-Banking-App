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
        { label: 'Overview', route: '/dashboard', icon: 'pi pi-home' }
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
        { label: 'Currency Converter', route: '/currency-converter', icon: 'pi pi-money-bill' },
        {label: 'QR code payment', route: '/qr-code-payment', icon: 'pi pi-qrcode' }
      ]
    },
    {
      title: 'Beneficiaries',
      items: [
        { label: 'Add Beneficiary', route: '/beneficiaries', icon: 'pi pi-users' },
        { label: 'View Beneficiaries', route: '/view-beneficiaries', icon: 'pi pi-users' }
      ]
    },
    {
      title: 'Transfers',
      items: [
        { label: 'Domestic', route: '/transfer-funds/domestic', icon: 'pi pi-exchange' },
        { label: 'International', route: '/transfer-funds/international', icon: 'pi pi-send' },
        { label: 'Intra-Account', route: '/transfer-funds/intra-account', icon: 'pi pi-sitemap' },
        { label: 'Within Bank', route: '/transfer-funds/within-bank', icon: 'pi pi-building' }
      ]
    },
    {
      title: 'Payments',
      items: [
        { label: 'Recurring Payments', route: '/recurring-payments', icon: 'pi pi-replay' },
        { label: 'Marketplace', route: '/marketplace', icon: 'pi pi-shopping-cart' }
      ]
    },
    {
      title: 'Loans',
      items: [
        { label: 'Loan Application', route: '/loan-application', icon: 'pi pi-file-edit' },
        { label: 'Loan Tracking', route: '/loan-tracking', icon: 'pi pi-search' }
      ]
    },
    {
      title: 'Account Operations',
      items: [
        { label: 'All Account Operations', route: '/account-operations', icon: 'pi pi-cog' }
      ]
    },
    {
      title: 'Card Management',
      items: [
        { label: 'Credit Cards', route: '/card-management/credit-cards', icon: 'pi pi-credit-card' },
        { label: 'Debit Cards', route: '/card-management/debit-cards', icon: 'pi pi-wallet' }
      ]
    }
  ];
}
