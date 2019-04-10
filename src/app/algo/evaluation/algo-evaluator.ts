import { OptimizerResult } from './../ReservationOptimizer';
import { Reservation } from './../../domain/reservation/reservation';
import { Property } from './../../domain/immo/property';
import { Observable } from 'rxjs';

export interface EvaluationResult {

    /** bigger is better, negative is possible, 0 has no specific meaning */
    score: number;

    /** a string[] to explain the score (log lines)*/
    log: string[];

}

export interface AlgoEvaluator {

    /**
     * @param property Property
     * @param orig Reservation[]
     * @param solution$ an Observable<OptimizerResult>
     * @returns an observable that submits a number whenever the given 'solution$' observale gets a new solution
     */
    evaluate$(property: Property, orig: Reservation[], solution$: Observable<OptimizerResult>): Observable<EvaluationResult>;

}
