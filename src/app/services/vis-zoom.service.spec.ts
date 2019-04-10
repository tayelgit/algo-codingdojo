/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VisZoomService } from './vis-zoom.service';

describe('Service: VisZoom', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisZoomService]
    });
  });

  it('should ...', inject([VisZoomService], (service: VisZoomService) => {
    expect(service).toBeTruthy();
  }));
});
