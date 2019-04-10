import { ChronoUnit } from 'js-joda';
import { ReservationUtils } from './../../domain/reservation/reservation-utils';
import { map } from 'rxjs/operators';
import { OptimizerResult } from './../ReservationOptimizer';
import { Observable } from 'rxjs';
import { Property } from './../../domain/immo/property';
import { AlgoEvaluator, EvaluationResult } from './algo-evaluator';
import { Reservation } from 'src/app/domain/reservation/reservation';

export class AlgoEvaluatorV1 implements AlgoEvaluator {

    private WEIGHT_SPACES = -2;
    private WEIGHT_SUCCESSFUL = 1;
    private WEIGHT_CHANGED = -1;


    private totalDays: number;
    private porperty: Property;
    private origReservations: Reservation[];
    private origReservationsMap: Map<string, Reservation>;

    evaluate$(property: Property, origReservations: Reservation[], solution$: Observable<OptimizerResult>): Observable<EvaluationResult> {

        // preconditions
        if (!property) {
            throw new Error('Evaluator needs a property!');
        }
        if (!origReservations || origReservations.length === 0) {
            throw new Error('Evaluator needs original reservations!');
        }
        if (!solution$) {
            throw new Error('Evaluator needs a solution Observable!');
        }


        // evaluator state
        this.porperty = property;
        this.origReservations = origReservations;
        this.totalDays = this.sumUpDaysOfAllReservations(origReservations);
        this.origReservationsMap = ReservationUtils.getReservationsAsMap(origReservations);

        // whenever the given solution$ observable sends a new result
        // evaluate it and send the number back through the Observable we return here
        return solution$.pipe(
            map(optimizerResult => this.evaluate(optimizerResult))
        );

    }

    private evaluate(optimizerResult: OptimizerResult): EvaluationResult {

        // collect a log to explain the resulting score
        const log = new Array<string>();



        // it's better to have more successful days/nights
        const successfulDays = this.sumUpDaysOfAllReservations(optimizerResult.successfulReservations);
        const factorSuccessfulDays = successfulDays / this.totalDays;



        // penalty for reservations that already had a room and this room was changed
        let daysWithChangedRooms = 0;
        for (const resultRes of optimizerResult.successfulReservations) {
            const origRes = this.origReservationsMap.get(resultRes.id);
            if (origRes.roomId && origRes.roomId !== Reservation.NO_ROOM && origRes.roomId !== resultRes.roomId) {
                /* if the original reservation already had a room set but now there is another
                    room set for this reservation, give a penalty */
                const days = ReservationUtils.getLengthOfReservationInDays(resultRes);
                log.push(`Penalty (${days} days) for the reservation with id '${resultRes.id}' because its room changed from '${origRes.roomId}' to '${resultRes.roomId}'`);
                daysWithChangedRooms += days;
            }
        }
        const factorChangedDays = daysWithChangedRooms / this.totalDays;


        // penalty for spaces between reservations (fragmentation)
        let factorSpaces = 0;
        if (this.origReservations.length > 1) {
            // no spaces if there are less than 2 reservations
            let spaces = 0;
            const roomMap = ReservationUtils.getMapReservationsPerRoom(optimizerResult.successfulReservations);
            roomMap.forEach((reservations: Reservation[], roomId: string) => {
                if (roomId && roomId !== Reservation.NO_ROOM) {
                    // just evaluate reservations with rooms
                    ReservationUtils.orderByStartDate(reservations);
                    let lastEnd = null;
                    for (const res of reservations) {
                        if (lastEnd !== null) {
                            if (lastEnd.until(res.start, ChronoUnit.DAYS) >= 1) {
                                spaces++;
                            }
                        }
                        lastEnd = res.end;
                    }
                }
            });
            const maxSpacesPossible = this.origReservations.length - 1;
            factorSpaces = spaces / maxSpacesPossible; // can't be div/0 because of if block above
        }

        // ATTENTION:
        // always have to change text 3 times when changing this!
        // the math, and two times in the log! .. don't forget!
        /* could do the math AND build the log by using some api to calculate the score like
              score = calc(logArray)
                  .add(4)
                  .multiply(2)
                  .done()
         */
        const score =
            this.totalDays * factorSuccessfulDays * this.WEIGHT_SUCCESSFUL
            + this.totalDays * factorChangedDays * this.WEIGHT_CHANGED
            + factorSpaces * this.WEIGHT_SPACES
        ;
        log.push('-');
        log.push(`Score:`);
        log.push(`totalDays = total days of all reservations summed up (${this.totalDays})`);
        log.push(`factorSuccessfulDays = days of successful reservations summed up / totalDays (${factorSuccessfulDays})`);
        log.push(`factorChangedDays = days of reservations that changed its room / totalDays (${factorChangedDays})`);
        log.push(`factorSpaces = the number of spaces between reservations / total number of reservations minus 1 (max possible spaces) (${factorSpaces})`);
        log.push(`totalDays * factorSuccessfulDays * WEIGHT_SUCCESSFUL + totalDays * factorChangedDays * WEIGHT_CHANGED + factorSpaces * WEIGHT_SPACES`);
        log.push('-');
        log.push(`(${this.totalDays} * ${factorSuccessfulDays} * ${this.WEIGHT_SUCCESSFUL}) + (${this.totalDays} * ${factorChangedDays} * ${this.WEIGHT_CHANGED}) + (${factorSpaces} * ${this.WEIGHT_SPACES})`);

        return {
            score: score,
            log: log
        };
    }

    private sumUpDaysOfAllReservations(reservations: Reservation[]) {
        if (!reservations || reservations.length === 0) {
            return 0;
        }
        return reservations
            .map(res => ReservationUtils.getLengthOfReservationInDays(res))
            .reduce((sum, days) => sum + days);
    }

}
