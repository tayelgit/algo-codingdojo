/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OptimizerService } from './optimizer.service';

describe('Service: Optimizer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OptimizerService]
    });
  });

  it('should ...', inject([OptimizerService], (service: OptimizerService) => {
    expect(service).toBeTruthy();
  }));
});
