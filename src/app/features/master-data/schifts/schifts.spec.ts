import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Schifts } from './schifts';

describe('Schifts', () => {
  let component: Schifts;
  let fixture: ComponentFixture<Schifts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Schifts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Schifts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
