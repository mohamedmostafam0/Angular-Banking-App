import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardWidgetComponent } from './credit-card-widget.component';

describe('CreditCardWidgetComponent', () => {
  let component: CreditCardWidgetComponent;
  let fixture: ComponentFixture<CreditCardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditCardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
