import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Corners } from './corners';

describe('Corners', () => {
  let component: Corners;
  let fixture: ComponentFixture<Corners>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Corners]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Corners);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
