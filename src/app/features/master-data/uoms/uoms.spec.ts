import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Uoms } from './uoms';

describe('Uoms', () => {
  let component: Uoms;
  let fixture: ComponentFixture<Uoms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Uoms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Uoms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
