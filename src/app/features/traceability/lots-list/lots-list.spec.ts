import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotsList } from './lots-list';

describe('LotsList', () => {
  let component: LotsList;
  let fixture: ComponentFixture<LotsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
