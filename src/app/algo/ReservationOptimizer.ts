import { Property } from './../domain/immo/property';
import { Observable } from 'rxjs';
import { Reservation } from '../domain/reservation/reservation';

export interface ReservationOptimizer {
    optimize(data: OptimizerData): Observable<OptimizerResult>;
}

export interface OptimizerData {
    property: Property;
    reservations: Reservation[];
}

export interface OptimizerResult {
    successfulReservations: Reservation[];
    problematicReservations?: Reservation[];
    isFullSolution: boolean;
}
