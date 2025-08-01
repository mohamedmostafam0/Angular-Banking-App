import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { AccountOperationsComponent } from './pages/account-operations/account-operations.component';
import { AuthGuard } from './guards/auth.guard';
import { SettingsComponent } from './pages/settings/settings.component';

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
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },
  
  // Redirect any unknown paths to dashboard
  { path: '**', redirectTo: '/dashboard' }
];
