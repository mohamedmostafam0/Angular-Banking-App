import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodePaymentComponent } from './qr-code-payment.component';

describe('QrCodePaymentComponent', () => {
  let component: QrCodePaymentComponent;
  let fixture: ComponentFixture<QrCodePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCodePaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrCodePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
