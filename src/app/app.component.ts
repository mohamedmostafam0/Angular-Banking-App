import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { CurrencyConverterComponent } from './components/currency-converter/currency-converter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class AppComponent implements OnInit {

  constructor(
    public authService: AuthService, 
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.authService.authState$.subscribe(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/login']);
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      map(route => route.snapshot.title)
    ).subscribe((title: string | undefined) => {
      if (title) {
        this.titleService.setTitle(`${title} - Banking App`);
      }
    });
  }
}
