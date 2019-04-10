import { Observable, Subscriber } from 'rxjs';
import { OptimizerData, OptimizerResult, ReservationOptimizer } from './ReservationOptimizer';

export abstract class AbstractReservationOptimizer implements ReservationOptimizer {

    public optimize(data: OptimizerData): Observable<OptimizerResult> {

        return new Observable((subscriber$) => {
            // this rxjs subject gets notified asynchronously on new results
            // const subject$ = new Subject<OptimizerResult>();

            this.optimizeInternal(
                {
                    // to ensure immutablility I copy into a new object
                    property: data.property,                // Property is immutable
                    reservations: data.reservations.slice() // Reservation is immutable but not the array
                },
                subscriber$
            );
        });
    }

    protected abstract optimizeInternal(data: OptimizerData, subject$: Subscriber<OptimizerResult>): void;

}
