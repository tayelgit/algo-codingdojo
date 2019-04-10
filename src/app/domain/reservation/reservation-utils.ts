import { LocalDateTime, ChronoUnit } from 'js-joda';
import { Property } from '../immo/property';
import { Reservation } from './reservation';

export interface ReservationsTimeslot {
    start: LocalDateTime;
    end: LocalDateTime;
    reservations: Reservation[];
}

export class ReservationUtils {

    /**
     * combines all other checks
     */
    public static checkData(reservations: Reservation[], property: Property): void {
        if (!reservations) {
            throw new Error('Reservations is ' + reservations);
        }
        if (!property) {
            throw new Error('property is ' + property);
        }
        if (reservations.some(r => !r)) {
            throw new Error('At least one reservation in the array is null or undefined!');
        }
        ReservationUtils.checkNoIdTwice(reservations, property);
        ReservationUtils.checkReservationsAgainstProperty(reservations, property);
        ReservationUtils.checkNoOverlaps(reservations);
    }

    public static checkAllHaveARoom(reservations: Reservation[]): void {
        const noRooms = [];
        for (const r of reservations) {
            if (!r.roomId) {
                noRooms.push(r.id);
            }
        }
        if (noRooms.length > 0) {
            throw new Error(`The following reservations have no room set: ${JSON.stringify(noRooms)}`);
        }
    }

    /**
     * throws an error if the array holds more than one reservation with the same id
     * (should probably change array->map soon)
     */
    public static checkNoIdTwice(reservations: Reservation[], property: Property): void {
        // TODO: generally use (Immutable)Map instead of array for reservations?!
        // I don't reuse getReservationsAsMap because I can't ensure that nobody removes the throwing of an error there
        reservations.reduce((map: Map<string, Reservation>, res: Reservation) => {
            const former = map.get(res.id);
            if (former) {
                throw new Error(`At least two reservatoins with id '${res.id}' detected!`);
            } else {
                map.set(res.id, res);
            }
            return map;
        }, new Map<string, Reservation>());
    }

    /**
     * @param reservations the reservations as array
     * @returns the reservations as map with the id of each reservation as key
     */
    public static getReservationsAsMap(reservations: Reservation[]): Map<string, Reservation> {
        return reservations.reduce((map: Map<string, Reservation>, res: Reservation) => {
            const former = map.get(res.id);
            if (former) {
                throw new Error(`At least two reservatoins with id '${res.id}' detected!`);
            } else {
                map.set(res.id, res);
            }
            return map;
        }, new Map<string, Reservation>());
    }


    /**
     * calls checkReservationAgainstProperty on each element of the array
     */
    public static checkReservationsAgainstProperty(reservations: Reservation[], property: Property): void {
        if (!reservations) {
            throw new Error('Check needs a Reservation!');
        }
        if (!property) {
            throw new Error('Check needs a Property!');
        }
        reservations.forEach(r => this.checkReservationAgainstProperty(r, property));
    }


    /**
     * throws an error if the given room and kategorie of the reservation exist in the property
     */
    public static checkReservationAgainstProperty(res: Reservation, property: Property): void {
        if (!res) {
            throw new Error('Check needs a Reservation!');
        }
        if (!property) {
            throw new Error('Check needs a Property!');
        }
        if (res.roomId && res.kategorieId) {
            const katOfRoom = property.getKategoryOfRoom(res.roomId);
            if (!katOfRoom) {
                throw new Error(`Reservation '${res.id}': There is no room with id '${res.roomId}' in this property!`);
            }
            if (katOfRoom !== res.kategorieId) {
                // tslint:disable-next-line:max-line-length
                throw new Error(`Reservation '${res.id}': Kategorie '${res.kategorieId}' and room '${res.roomId}' do not fit with this property!`);
            }
        }
    }

    /**
     * throws an error if two reservations occupy the same room at the same time
     */
    public static checkNoOverlaps(reservations: Reservation[]): void {
        // order reservations per room in a map (roomid->reservations)
        const reservationsPerRoom = ReservationUtils.getMapReservationsPerRoom(reservations);
        // check overlaps for each room
        for (const roomId of Array.from(reservationsPerRoom.keys())) {
            if (roomId === Reservation.NO_ROOM) {
                continue;
            }
            const resArr = reservationsPerRoom.get(roomId);
            ReservationUtils.checkNoOverlapsRegardlessOfRooms(resArr);
        }
    }

    /**
     * throws an error if two of the given reservations occupy the same timeslot
     */
    public static checkNoOverlapsRegardlessOfRooms(resArr: Reservation[]): void {
        if (!resArr || resArr.length === 0) {
            return;
        }
        // check that an earlier reservation is finished before the next starts

        this.orderByStartDate(resArr);

        let lastRes = null;
        let lastEnd = LocalDateTime.of(0, 1, 1);    // 1 Jan 0000 at 00:00:00
        for (const res of resArr) {
            if (lastRes) {
                // check against the former reservation
                if (res.start.isBefore(lastEnd)) {
                    throw new Error(
                        `Reservation Overlab found for room '${res.roomId}'!
                            ${JSON.stringify(lastRes)}
                            ${JSON.stringify(res)}
                    `);
                }
            }
            // this res is the next lastRes...
            lastRes = res;
            lastEnd = res.end;
        }

    }


    /**
     * returns an object with the earliest start and the latest end date
     */
    public static getTimeSpan(resArr: Reservation[]): {start: LocalDateTime, end: LocalDateTime} {

        if (!resArr || resArr.length === 0) {
            throw new Error(`Makes no sense to getTimeSpan of ${resArr}`);
        }

        let start = null;
        let end = null;

        for (const r of resArr) {
            if (start === null || r.start < start) {
                start = r.start;
            }
            if (end === null || r.end > end) {
                end = r.end;
            }
        }

        return {
            start: start,
            end: end
        };
    }


    public static orderByStartDate(resArr: Reservation[], asc = true): void {
        this.order(resArr, (r1, r2) => r2.start.until(r1.start, ChronoUnit.MILLIS), asc);
    }
    public static orderByEndDate(resArr: Reservation[], asc = true): void {
        this.order(resArr, (r1, r2) => r2.end.until(r1.end, ChronoUnit.MILLIS), asc);
    }
    public static order(resArr: Reservation[], sorter: (r1: Reservation, r2: Reservation) => number, asc: boolean): void {
        if (!resArr) { throw new Error(`Makes no sense to order ${resArr}`); }
        if (!sorter) { throw new Error(`Makes no sense to order without a sorter${resArr}`); }
        resArr.sort(sorter);
        if (!asc) {
            resArr.reverse();
        }
    }



    /**
     * Builds and returns a Map that returns reservations by room id.
     * If the reservation has no room id set, it is added to the map with the key(fake roomid) Reservation.NO_ROOM
     */
    public static getMapReservationsPerRoom(reservations: Reservation[], katName?: string) {
        const reservationsPerRoom = new Map<string, Reservation[]>();
        reservations

            // if a kategorie name was given...only work with reservations of this kategorie
            .filter(res => !katName || res.kategorieId === katName)

            .forEach(res => {
                // check validity of reservation room/kategorie data
                let roomId = res.roomId;
                if (!roomId) {
                    // if the reservation has no roomid yet, add it to the map with the key saved in Reservation.NO_ROOM
                    roomId = Reservation.NO_ROOM;
                }
                let resArr = reservationsPerRoom.get(roomId);
                if (!resArr) {
                    // this is the first reservation for a specific roomid
                    resArr = [res];
                    reservationsPerRoom.set(roomId, resArr);
                } else {
                    // we already have a list of reservations for this roomId
                    resArr.push(res);
                }
            });
        return reservationsPerRoom;
    }

    /**
     * Builds and returns a Map that returns reservations by kategorie id.
     */
    public static getMapReservationsPerKategorie(reservations: Reservation[]) {
        const reservationsPerKategorie = new Map<string, Reservation[]>();
        reservations.forEach(res => {
            // check validity of reservation room/kategorie data
            const katId = res.kategorieId;
            if (!katId) {
                throw new Error(`Reservation '${res.id}' has no Kategorie set!`);
            }
            let resArr = reservationsPerKategorie.get(katId);
            if (!resArr) {
                // this is the first reservation for a specific roomid
                resArr = [res];
                reservationsPerKategorie.set(katId, resArr);
            } else {
                // we already have a list of reservations for this roomId
                resArr.push(res);
            }
        });
        return reservationsPerKategorie;
    }

    /**
     * Returns an array of 'ReservationsTimeslot'. Each element stands for a specific timeslot
     * with a start and end time and all reservations that are active during this time period.
     * (So basically whenever the reservation state changes, a new timeslot is added to this array)
     *
     * @param reservations the reservations to be 'timeslotted'
     */
    public static getTimeslotsArrayFromReservations(reservations: Reservation[]): ReservationsTimeslot[] {

        // copy array to not change given array
        reservations = reservations.slice();
        ReservationUtils.orderByStartDate(reservations);

        // a stack holding all reservations that exists at a specific timeslot
        const stackOfCurrentResOrderedFirstEndDateIsLast = new Array<Reservation>();

        let lastRes = null;
        let currentTimeslot: ReservationsTimeslot = null;
        const timeslots = new Array<ReservationsTimeslot>();

        reservations.forEach(currentRes => {

            const startOfCurrentRes = currentRes.start;

            // search for reservations on the stack that are already ended at the current timeslot
            while (stackOfCurrentResOrderedFirstEndDateIsLast.length > 0) {

                const firstEndingResOnStack = stackOfCurrentResOrderedFirstEndDateIsLast.pop();
                if (firstEndingResOnStack.end <= startOfCurrentRes) {
                    /* there is a reservation on the stack, that ends before or at the same time as the current reservation starts
                     * so I have to finish that former timeslot before starting the new one
                     * If there is a time range between the end of the former and the new timeslot I have to add a
                     * timeslot (without that fromer reservation) before I add a timeslot with the new reservation */

                    // end of last timeslot at new starttime
                    if (currentTimeslot.end != null) { throw new Error('.end was already set!'); }
                    currentTimeslot.end = firstEndingResOnStack.end;

                    // new timeslot
                    currentTimeslot = {
                        start: firstEndingResOnStack.end,
                        end: null,                              // don't know yet will be set later
                        reservations: stackOfCurrentResOrderedFirstEndDateIsLast.slice()  // copy of current stack
                    };
                    timeslots.push(currentTimeslot);
                } else {
                    // put back on stack, this reservation is still active at the current timeslot
                    stackOfCurrentResOrderedFirstEndDateIsLast.push(firstEndingResOnStack);
                    // if this reservation is not over, the others are all active as well, as this stack is ordered
                    // ...so break the while loop
                    break;
                }
            }

            // add the new reservation to the stack
            stackOfCurrentResOrderedFirstEndDateIsLast.push(currentRes);
            // keep the stack ordered
            ReservationUtils.orderByEndDate(stackOfCurrentResOrderedFirstEndDateIsLast, false);

            if (currentTimeslot) {
                if (currentTimeslot.start.isBefore(currentRes.start)) {
                    // there is a former timeslot
                    // ...set the end of it to the starttime of the new timeslot
                    if (currentTimeslot.end != null) { throw new Error('.end was already set!'); }
                    currentTimeslot.end = currentRes.start;

                    // new timeslot
                    currentTimeslot = {
                        start: currentRes.start,
                        end: null,                              // don't know yet will be set later
                        reservations: stackOfCurrentResOrderedFirstEndDateIsLast.slice()  // copy of current stack
                    };
                    timeslots.push(currentTimeslot);

                } else if (currentTimeslot.start.equals(currentRes.start)) {
                    /* multiple reservations starting at the same time
                        (a timeslot with this startime is already here)
                        ...just add the current reservation also to the timeslot */
                        currentTimeslot.reservations = stackOfCurrentResOrderedFirstEndDateIsLast.slice();
                } else {
                    throw new Error(
                        `The current timeslot starts later than the current Reservation.
                        This is not possible if the reservations are ordered!
                    `);
                }

            } else {
                // no timeslot yet...add a new one

                currentTimeslot = {
                    start: currentRes.start,
                    end: null,                              // don't know yet will be set later
                    reservations: stackOfCurrentResOrderedFirstEndDateIsLast.slice()  // copy of current stack
                };
                timeslots.push(currentTimeslot);

            }

            lastRes = currentRes;
        });

        // at the end, make new timeslots where the reservations still in the stack end
        while (stackOfCurrentResOrderedFirstEndDateIsLast.length > 0) {
            const firstEndingResOnStack = stackOfCurrentResOrderedFirstEndDateIsLast.pop();
            const endDate = firstEndingResOnStack.end;

            // remove all reservations with the same end time form stack
            // as they simply fall into the same timeslot
            if (stackOfCurrentResOrderedFirstEndDateIsLast.length > 0) {
                let nextOnStack = stackOfCurrentResOrderedFirstEndDateIsLast[stackOfCurrentResOrderedFirstEndDateIsLast.length - 1];
                while (nextOnStack && nextOnStack.end.equals(endDate)) {
                    stackOfCurrentResOrderedFirstEndDateIsLast.pop();
                    nextOnStack = stackOfCurrentResOrderedFirstEndDateIsLast[stackOfCurrentResOrderedFirstEndDateIsLast.length - 1];
                }
            }

            // there is a former timeslot
            // ...set the end of it to the starttime of the new timeslot
            if (currentTimeslot.end != null) { throw new Error('.end was already set!'); }
            currentTimeslot.end = endDate;

            if (stackOfCurrentResOrderedFirstEndDateIsLast.length > 0) {
                // new timeslot
                currentTimeslot = {
                    start: endDate,
                    end: null,                              // don't know yet will be set later
                    reservations: stackOfCurrentResOrderedFirstEndDateIsLast.slice()  // copy of current stack
                };
                timeslots.push(currentTimeslot);
            }
        }

        // the last timeslot ends with the last reservation
        if (lastRes && currentTimeslot) {
            currentTimeslot.end = lastRes.to;
        }

        console.log(timeslots);
        return timeslots;
    }


    /**
     * Returns an array of reservations that are active at the given time
     */
    public static getReservationsAtDate(reservationsTimeslots: ReservationsTimeslot[], date: LocalDateTime): Reservation[] {

        if (date.isBefore(reservationsTimeslots[0].start)) {
            // no reservations before the first timeslot
            return [];
        } else if (date.isAfter(reservationsTimeslots[reservationsTimeslots.length - 1].end)) {
            // no reservations after the last timeslot
            return [];
        }

        for (let i = 0; i < reservationsTimeslots.length; i++) {
            const reservationsTimeslot = reservationsTimeslots[i];
            if (date < reservationsTimeslot.end) {
                // return a copy to stay immutable
                return reservationsTimeslot.reservations.slice();
            } else if (date.equals(reservationsTimeslot.end) && i < reservationsTimeslots.length - 1) {
                // exactly at the border of a timeslot we also have to return the
                // reservations of the next timeslot (if there are some)
                const resOfNextTimeslot = reservationsTimeslots[i + 1].reservations;
                // concat returns a new array and does not change the two existing arrays (immutabilitywise ok)
                return reservationsTimeslot.reservations.concat(resOfNextTimeslot);
            }
        }

    }


    /**
     * One simple approach to get a roomId for a reservation. It is not very intelligent though.
     * It basically just decides which room to take by summing up the time that would remain between
     * this reservation and the two other reservations before and after. (If no reservation
     * is present before/after it takes 1Month.)
     *
     * This prefers to place reservations exactly between two other reservations (to efficently fill up space)
     */
    // tslint:disable-next-line:max-line-length
    public static getRoomForReservation(property: Property, reservations: Reservation[], resWithoutRoom: Reservation): string {

        const possibleRooms = Array.from(property.getRoomsOfKat(resWithoutRoom.kategorieId));
        const resPerRoom = ReservationUtils.getMapReservationsPerRoom(reservations, resWithoutRoom.kategorieId);

        const roomFitData: ({roomId: string, freeRangeBefore: number, freeRangeAfter: number}[]) = [];

        const now = LocalDateTime.now();
        const MILLIS_ONE_MONTH: number = now.until(now.plus(1, ChronoUnit.MONTHS), ChronoUnit.MILLIS);

        possibleRooms.forEach(room => {

            const resOfRoom = resPerRoom.get(room.id);
            if (!resOfRoom || resOfRoom.length === 0) {
                // no reservations for this room yet
                // the algo should try to fill other rooms, so give it a fake range
                roomFitData.push({
                    roomId: room.id,
                    freeRangeBefore:    MILLIS_ONE_MONTH,
                    freeRangeAfter:     MILLIS_ONE_MONTH
                });
                return;
            } else {
                try {
                    const temp = resOfRoom.slice();
                    temp.push(resWithoutRoom);
                    ReservationUtils.checkNoOverlapsRegardlessOfRooms(temp);
                } catch (e) {
                    // room is already reserved at this time
                    return;
                }
            }
            ReservationUtils.orderByStartDate(resOfRoom);
            /** The reservations in resOfRooms can not overlap, so ordered by start equals ordered by end */

            // get reservation before and after searched timeslot
            let resBefore: Reservation = null;
            let resAfter: Reservation = null;

            for (let i = 0; i < resOfRoom.length; i++) {
                const r = resOfRoom[i];
                if (r.end <= resWithoutRoom.start) {
                    resBefore = r;
                } else if (r.start >= resWithoutRoom.end) {
                    resAfter = r;
                }
            }
            if (resBefore || resAfter) {
                roomFitData.push({
                    roomId: room.id,
                    freeRangeBefore:    resBefore ? resBefore.end.until(resWithoutRoom.start, ChronoUnit.MILLIS) :  MILLIS_ONE_MONTH,
                    freeRangeAfter:     resAfter ?  resWithoutRoom.end.until(resAfter.start, ChronoUnit.MILLIS) :   MILLIS_ONE_MONTH,
                });
            } else {
                // reservation does not fit in this room
            }

        });

        let bestRoom: string = null;
        let minDist: number = Number.POSITIVE_INFINITY;

        roomFitData.forEach(rfd => {
            const sum = rfd.freeRangeBefore + rfd.freeRangeAfter;
            if (sum < minDist) {
                bestRoom = rfd.roomId;
                minDist = sum;
            }
        });

        return bestRoom;
    }

    /**
     * returns the length of the reservation in days.
     * Throws errors if the reservation or the dates inside are not valid for calculation.
     */
    public static getLengthOfReservationInDays(res: Reservation) {
        if (!res) {
            throw new Error('Can\'t calc length of ' + res);
        }
        if (!res.start || !res.end) {
            throw new Error('Start and/or end value for this reservation is not a DateTime! ' + res);
        }
        return res.start.until(res.end, ChronoUnit.DAYS);
    }

}
