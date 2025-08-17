import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTrackingComponent } from './loan-tracking.component';

describe('LoanTrackingComponent', () => {
  let component: LoanTrackingComponent;
  let fixture: ComponentFixture<LoanTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanTrackingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
