import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Page Components
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountsComponent } from './pages/accounts/accounts.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AccountOperationsComponent } from './pages/account-operations/account-operations.component';

const routes: Routes = [
  // Public routes
  { 
    path: 'login', 
    component: LoginComponent 
  },
  
  // Default route with children (protected routes)
  {
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '',
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent
      },
      { 
        path: 'accounts', 
        component: AccountsComponent
      },
      { 
        path: 'transactions', 
        component: TransactionsComponent
      },
      { 
        path: 'account-operations', 
        component: AccountOperationsComponent
      },
      // Default child route
    ]
  },
  
  // Wildcard route - must be last
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
