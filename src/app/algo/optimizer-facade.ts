import { TestOptimizer } from './test-optimizer';
import { ReservationUtils } from './../domain/reservation/reservation-utils';
import { Observable } from 'rxjs';
import { ReservationOptimizer, OptimizerData, OptimizerResult } from './ReservationOptimizer';
import { tap } from 'rxjs/operators';

/**
 * purpose:
 * selection of optimizers
 * checks optimizer input and results
 */
export class OptimizerFacade implements ReservationOptimizer {

    // holds functions to get a new optimizer instance
    private readonly newOptimizerInstanceProvider: Map<string, () => ReservationOptimizer> = new Map();

    constructor() {
      // TODO use Dependency Injection
      this.newOptimizerInstanceProvider.set('simple', () => new TestOptimizer());
      // this.newOptimizerInstanceProvider.set('simple', () => new OptimizerV1());

      console.log('available optimizers ', this.newOptimizerInstanceProvider.keys());

    }

    private selectedOptimizer = 'simple';

    optimize(data: OptimizerData): Observable<OptimizerResult> {

        // first check if the input is valid
        ReservationUtils.checkData(data.reservations, data.property);

        // calls the provider function of the selected optimizer and calls optimize on that instance
        const instanceProvider = this.newOptimizerInstanceProvider.get(this.selectedOptimizer);
        if (!instanceProvider) {
            throw new Error(`No Optimizer-Provider found for '${this.selectedOptimizer}'`);
        }
        const optimizerInstance = instanceProvider();
        if (!optimizerInstance) {
          throw new Error(`No Optimizer Instance found for '${this.selectedOptimizer}'`);
        }
        return optimizerInstance
            .optimize(data)
            .pipe(
                tap(optResult => {
                    console.log('Optimizer result', optResult);
                    // these checks throw errors if they spot problems in the optimized reservations
                    ReservationUtils.checkData(optResult.successfulReservations, data.property);
                    ReservationUtils.checkAllHaveARoom(optResult.successfulReservations);
                })
            );
    }

}
