import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCreditCardComponent } from './request-credit-card.component';

describe('RequestCreditCardComponent', () => {
  let component: RequestCreditCardComponent;
  let fixture: ComponentFixture<RequestCreditCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestCreditCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestCreditCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
