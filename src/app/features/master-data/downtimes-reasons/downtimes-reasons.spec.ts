import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DowntimesReasons } from './downtimes-reasons';

describe('DowntimesReasons', () => {
  let component: DowntimesReasons;
  let fixture: ComponentFixture<DowntimesReasons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DowntimesReasons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DowntimesReasons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
