import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoanApplicationComponent } from './loan-application.component';

describe('LoanApplicationComponent', () => {
  let component: LoanApplicationComponent;
  let fixture: ComponentFixture<LoanApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanApplicationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set displayTermsDialog to true when showTermsDialog is called', () => {
    component.showTermsDialog();
    expect(component.displayTermsDialog).toBeTrue();
  });

  it('should display the terms and conditions dialog when the link is clicked', () => {
    component.activeIndex = 4;
    fixture.detectChanges();

    const termsLink = fixture.debugElement.query(By.css('a'));
    termsLink.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.displayTermsDialog).toBeTrue();
  });
});
