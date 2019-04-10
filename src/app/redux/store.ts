import { OptimizerResult } from './../algo/ReservationOptimizer';
import { Property } from './../domain/immo/property';
import { Reservation } from '../domain/reservation/reservation';
import { Room } from '../domain/immo/room';

export interface AlgoTestState {

    /** the building */
    property: Property;

    /** orig reservations */
    reservations: Reservation[];

    /** optimized reservations */
    optimizerResult: OptimizerResult;

}

export enum ReduxActions {
    NEW_INPUT,
    NEW_OPTIMIZATION
}

export const INITIAL_STATE: AlgoTestState = {
    property: new Property([new Room('TestRoom1', 'TestKat1')]),
    reservations: new Array<Reservation>(),
    optimizerResult: null
};

export function rootReducer(state: AlgoTestState, action: any): AlgoTestState {

    switch (action.type) {

        case ReduxActions.NEW_INPUT: {
            // console.log('ReduxActions.NEW_INPUT');

            if (!action.property) {
                throw new Error(action.type + ' needs a property');
            }
            if (!action.reservations) {
                throw new Error(action.type + ' needs reservations');
            }

            const o = Object.assign({}, state, {
                property: action.property,
                reservations: action.reservations.slice(),
            });

            // console.log('New Store State', o);

            return o;
        }

        case ReduxActions.NEW_OPTIMIZATION: {

            // console.log('ReduxActions.NEW_OPTIMIZATION');

            if (!action.optimizerResult) {
                throw new Error(action.type + ' needs an optimizerResult');
            }

            const o = Object.assign({}, state, {
                optimizerResult: action.optimizerResult,
            });

            console.log('New Store State', o);

            return o;
        }

    }

    return state;
}

