import { TestBed } from '@angular/core/testing';

import { Sensores } from './sensores';

describe('Sensores', () => {
  let service: Sensores;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sensores);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
