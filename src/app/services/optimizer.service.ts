import { OptimizerFacade } from './../algo/optimizer-facade';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ReservationOptimizer, OptimizerData, OptimizerResult } from '../algo/ReservationOptimizer';

@Injectable()
export class OptimizerService implements ReservationOptimizer {

    private readonly optimizerFacade = new OptimizerFacade();

    optimize(data: OptimizerData): Observable<OptimizerResult> {
        return this.optimizerFacade.optimize(data);
    }

}
