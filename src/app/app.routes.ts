import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'Login'
  },
  
  // Protected routes
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), 
        title: 'Dashboard' 
      },
      { 
        path: 'accounts', 
        loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent), 
        title: 'Accounts' 
      },
      { 
        path: 'transactions', 
        loadComponent: () => import('./pages/transactions/transactions.component').then(m => m.TransactionsComponent), 
        title: 'Transactions' 
      },
      { 
        path: 'account-operations', 
        loadComponent: () => import('./pages/account-operations/account-operations.component').then(m => m.AccountOperationsComponent), 
        title: 'Account Operations' 
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent), 
        title: 'Settings' 
      },
      { 
        path: 'currency-converter', 
        loadComponent: () => import('./components/currency-converter/currency-converter.component').then(m => m.CurrencyConverterComponent), 
        title: 'Currency Converter' 
      },
      { 
        path: 'budget-planning', 
        loadComponent: () => import('./pages/budget-planning/budget-planning.component').then(m => m.BudgetPlanningComponent), 
        title: 'Budget Planning' 
      },
      { 
        path: 'schedule-reports', 
        loadComponent: () => import('./pages/schedule-reports/schedule-reports.component').then(m => m.ScheduleReportsComponent), 
        title: 'Schedule Reports' 
      },
      { 
        path: 'transfer-funds/domestic', 
        loadComponent: () => import('./pages/transfer-funds/domestic-transfer/domestic-transfer.component').then(m => m.DomesticTransferComponent), 
        title: 'Domestic Transfer' 
      },
      { 
        path: 'transfer-funds/international', 
        loadComponent: () => import('./pages/transfer-funds/international-transfer/international-transfer.component').then(m => m.InternationalTransferComponent), 
        title: 'International Transfer' 
      },
      { 
        path: 'transfer-funds/intra-account', 
        loadComponent: () => import('./pages/transfer-funds/intra-account-transfer/intra-account-transfer.component').then(m => m.IntraAccountTransferComponent), 
        title: 'Intra-account Transfer' 
      },
      { 
        path: 'transfer-funds/within-bank', 
        loadComponent: () => import('./pages/transfer-funds/within-bank-transfer/within-bank-transfer.component').then(m => m.WithinBankTransferComponent), 
        title: 'Within Bank Transfer' 
      },
      { 
        path: 'qr-code-payment', 
        loadComponent: () => import('./pages/qr-code-payment/qr-code-payment.component').then(m => m.QrCodePaymentComponent), 
        title: 'QR Code Payment' 
      },
      { 
        path: 'beneficiaries', 
        loadComponent: () => import('./pages/beneficiaries/beneficiaries.component').then(m => m.BeneficiariesComponent), 
        title: 'Beneficiaries' 
      },
      { 
        path: 'view-beneficiaries', 
        loadComponent: () => import('./pages/view-beneficiaries/view-beneficiaries.component').then(m => m.ViewBeneficiariesComponent), 
        title: 'View Beneficiaries' 
      },
      { 
        path: 'recurring-payments', 
        loadComponent: () => import('./pages/recurring-payments/recurring-payments.component').then(m => m.RecurringPaymentsComponent), 
        title: 'Recurring Payments' 
      },
      { 
        path: 'marketplace', 
        loadComponent: () => import('./pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent), 
        title: 'Marketplace' 
      },
      { 
        path: 'loan-application', 
        loadComponent: () => import('./pages/loan-application/loan-application.component').then(m => m.LoanApplicationComponent), 
        title: 'Loan Application' 
      },
      { 
        path: 'loan-tracking', 
        loadComponent: () => import('./pages/loan-tracking/loan-tracking.component').then(m => m.LoanTrackingComponent), 
        title: 'Loan Tracking' 
      },
      { 
        path: 'card-management', 
        children: [
          { 
            path: 'credit-cards', 
            loadComponent: () => import('./pages/credit-cards/credit-cards.component').then(m => m.CreditCardsComponent), 
            title: 'Credit Cards' 
          },
          { 
            path: 'debit-cards', 
            loadComponent: () => import('./pages/debit-cards/debit-cards.component').then(m => m.DebitCardsComponent), 
            title: 'Debit Cards' 
          },
          { 
            path: 'request-credit-card', 
            loadComponent: () => import('./pages/request-credit-card/request-credit-card.component').then(m => m.RequestCreditCardComponent), 
            title: 'Request Credit Card' 
          }
        ]
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  
  // Redirect any unknown paths to dashboard
  { path: '**', redirectTo: '/dashboard' }
];
