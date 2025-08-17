import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Beneficiary } from '../../interfaces/beneficiary';

@Component({
  selector: 'app-view-beneficiaries',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ConfirmDialogModule,
    ToastModule,
    ChipModule,
    TooltipModule
  ],
  templateUrl: './view-beneficiaries.component.html',
  styleUrls: ['./view-beneficiaries.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class ViewBeneficiariesComponent implements OnInit {
  beneficiaries: Beneficiary[] = [];

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    const data = localStorage.getItem('beneficiaries');
    this.beneficiaries = data ? JSON.parse(data) : [];
  }

  saveBeneficiaries(): void {
    localStorage.setItem('beneficiaries', JSON.stringify(this.beneficiaries));
  }

  openNew(): void {
    this.router.navigate(['/beneficiaries']);
  }

  editBeneficiary(beneficiary: Beneficiary): void {
    this.router.navigate(['/beneficiaries', { id: beneficiary.id }]);
  }

  deleteBeneficiary(beneficiary: Beneficiary): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + beneficiary.name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.beneficiaries = this.beneficiaries.filter(b => b.id !== beneficiary.id);
        this.saveBeneficiaries();
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Beneficiary Deleted', life: 3000 });
      }
    });
  }

  toggleFavorite(beneficiary: Beneficiary, event: Event): void {
    beneficiary.isFavorite = !beneficiary.isFavorite;
    this.saveBeneficiaries();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: beneficiary.isFavorite ? 'Added to Favorites' : 'Removed from Favorites'
    });
    event.stopPropagation();
  }

  transferToBeneficiary(beneficiary: Beneficiary): void {
    if (beneficiary.isInternational) {
      this.router.navigate(['/transfer-funds/international', { beneficiaryId: beneficiary.id }]);
    } else {
      this.router.navigate(['/transfer-funds/domestic', { beneficiaryId: beneficiary.id }]);
    }
  }
}
