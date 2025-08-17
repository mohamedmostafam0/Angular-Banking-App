import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccordionModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    InputSwitchModule,
    TableModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  profile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890'
  };

  password = {
    current: '',
    new: '',
    confirm: ''
  };

  twoFactor = {
    sms: false,
    email: true
  };

  auditLog: any[] = [];

  ngOnInit() {
    this.auditLog = [
      {
        action: 'Logged In',
        date: new Date(),
        ip: '192.168.1.1'
      },
      {
        action: 'Changed Password',
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        ip: '192.168.1.1'
      },
      {
        action: 'Domestic Transfer',
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        ip: '192.168.1.1'
      }
    ];
  }
}