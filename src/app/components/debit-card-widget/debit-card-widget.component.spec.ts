import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebitCardWidgetComponent } from './debit-card-widget.component';

describe('DebitCardWidgetComponent', () => {
  let component: DebitCardWidgetComponent;
  let fixture: ComponentFixture<DebitCardWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebitCardWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebitCardWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
