import { Subscriber } from 'rxjs';
import { AbstractReservationOptimizer } from 'src/app/algo/abstract-reservation-optimizer';
import { OptimizerData, OptimizerResult } from './ReservationOptimizer';

export class TestOptimizer extends AbstractReservationOptimizer {

    protected optimizeInternal(data: OptimizerData, subscriber$: Subscriber<OptimizerResult>): void {

        const reservations = data.reservations;
        const property = data.property;

        const fakeResult: OptimizerResult = {
            successfulReservations: reservations.slice(), // slice = new array with same elements
            isFullSolution: true
        };

        subscriber$.next(fakeResult);
        subscriber$.complete();
    }

}
