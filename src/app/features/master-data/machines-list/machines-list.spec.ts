import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachinesList } from './machines-list';

describe('MachinesList', () => {
  let component: MachinesList;
  let fixture: ComponentFixture<MachinesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MachinesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MachinesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
