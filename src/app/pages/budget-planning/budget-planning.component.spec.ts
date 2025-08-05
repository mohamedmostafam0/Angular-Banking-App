import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPlanningComponent } from './budget-planning.component';

describe('BudgetPlanningComponent', () => {
  let component: BudgetPlanningComponent;
  let fixture: ComponentFixture<BudgetPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
