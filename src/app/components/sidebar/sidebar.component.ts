import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, PanelMenuModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-home',
        routerLink: '/dashboard'
      },
      {
        label: 'Accounts',
        icon: 'pi pi-fw pi-wallet',
        routerLink: '/accounts'
      },
      {
        label: 'Transactions',
        icon: 'pi pi-fw pi-chart-bar',
        routerLink: '/transactions'
      },
      {
        label: 'Account Operations',
        icon: 'pi pi-fw pi-cog',
        routerLink: '/account-operations'
      }
    ];
  }
}
