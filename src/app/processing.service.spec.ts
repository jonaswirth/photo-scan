import { TestBed } from '@angular/core/testing';

import { PrcoessingService } from './processing.service';

describe('Prcoessing', () => {
  let service: PrcoessingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrcoessingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
