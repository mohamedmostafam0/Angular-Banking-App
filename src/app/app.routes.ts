import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { AccountOperationsComponent } from './pages/account-operations/account-operations.component';
import { AuthGuard } from './guards/auth.guard';
import { SettingsComponent } from './pages/settings/settings.component';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { BudgetPlanningComponent } from './pages/budget-planning/budget-planning.component';
import { ScheduleReportsComponent } from './pages/schedule-reports/schedule-reports.component';
import { DomesticTransferComponent } from './pages/transfer-funds/domestic-transfer/domestic-transfer.component';
import { InternationalTransferComponent } from './pages/transfer-funds/international-transfer/international-transfer.component';
import { IntraAccountTransferComponent } from './pages/transfer-funds/intra-account-transfer/intra-account-transfer.component';
import { WithinBankTransferComponent } from './pages/transfer-funds/within-bank-transfer/within-bank-transfer.component';
import { QrCodePaymentComponent } from './pages/qr-code-payment/qr-code-payment.component';
import { BeneficiariesComponent } from './pages/beneficiaries/beneficiaries.component';
import { ViewBeneficiariesComponent } from './pages/view-beneficiaries/view-beneficiaries.component';
import { RecurringPaymentsComponent } from './pages/recurring-payments/recurring-payments.component';
import { MarketplaceComponent } from './pages/marketplace/marketplace.component';
import { LoanApplicationComponent } from './pages/loan-application/loan-application.component';
import { LoanTrackingComponent } from './pages/loan-tracking/loan-tracking.component';
import { CreditCardsComponent } from './pages/credit-cards/credit-cards.component';
import { DebitCardsComponent } from './pages/debit-cards/debit-cards.component';
import { RequestCreditCardComponent } from './pages/request-credit-card/request-credit-card.component';


export const routes: Routes = [
  // Public routes
    {
    path: 'login', 
    component: LoginComponent, 
    title: 'Login' 
    },
  
  // Protected routes
    {
    path: '',
        canActivate: [AuthGuard],
        children: [
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
      { path: 'accounts', component: AccountsComponent, title: 'Accounts' },
      { path: 'transactions', component: TransactionsComponent, title: 'Transactions' },
      { path: 'account-operations', component: AccountOperationsComponent, title: 'Account Operations' },
      { path: 'settings', component: SettingsComponent, title: 'Settings' },
      { path: 'currency-converter', component: CurrencyConverterComponent, title: 'Currency Converter' },
      { path: 'budget-planning', component: BudgetPlanningComponent, title: 'Budget Planning' },
      { path: 'schedule-reports', component: ScheduleReportsComponent, title: 'Schedule Reports' },
      { path: 'transfer-funds/domestic', component: DomesticTransferComponent, title: 'Domestic Transfer' },
      { path: 'transfer-funds/international', component: InternationalTransferComponent, title: 'International Transfer' },
      { path: 'transfer-funds/intra-account', component: IntraAccountTransferComponent, title: 'intra-account Transfer' },
      { path: 'transfer-funds/within-bank', component: WithinBankTransferComponent, title: 'Within Bank Transfer' },
      { path: 'qr-code-payment', component: QrCodePaymentComponent, title: 'QR Code Payment' },
      { path: 'beneficiaries', component: BeneficiariesComponent, title: 'Beneficiaries' },
      { path: 'view-beneficiaries', component: ViewBeneficiariesComponent, title: 'View Beneficiaries' },
      { path: 'recurring-payments', component: RecurringPaymentsComponent, title: 'Recurring Payments' },
      { path: 'marketplace', component: MarketplaceComponent, title: 'Marketplace' },
      { path: 'loan-application', component: LoanApplicationComponent, title: 'Loan Application' },
      { path: 'loan-tracking', component: LoanTrackingComponent, title: 'Loan Tracking' },
      { path: 'card-management', children: [
        { path: 'credit-cards', component: CreditCardsComponent, title: 'Credit Cards' },
        { path: 'debit-cards', component: DebitCardsComponent, title: 'Debit Cards' },
        { path: 'request-credit-card', component: RequestCreditCardComponent, title: 'Request Credit Card' }
      ]},
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  
  // Redirect any unknown paths to dashboard
  { path: '**', redirectTo: '/dashboard' }
];
