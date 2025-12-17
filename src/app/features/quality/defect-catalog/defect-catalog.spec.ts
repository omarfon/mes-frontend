import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectCatalog } from './defect-catalog';

describe('DefectCatalog', () => {
  let component: DefectCatalog;
  let fixture: ComponentFixture<DefectCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefectCatalog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefectCatalog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
