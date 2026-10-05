import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Alertas } from './alertas';

describe('Alertas', () => {
  let component: Alertas;
  let fixture: ComponentFixture<Alertas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alertas],
    }).compileComponents();

    fixture = TestBed.createComponent(Alertas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
