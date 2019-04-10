import { LocalDateTime } from 'js-joda';

/*
    I decided for this verbose code to have
        - key value in the constructor
        - but at the same time immutability of the object
    Is there any other way of doing this?
*/


export interface ReservationData {
    readonly id: string;
    readonly start: LocalDateTime;
    readonly end: LocalDateTime;

    /** if true/fixed it may not be changed by the algo, eg a placeholder for a room that has already been checked in */
    readonly fixed: boolean;

    readonly kategorieId: string;

    /** ensure that the roomId fits to the kategorie id in your property */
    readonly roomId?: string;
}

export class Reservation implements ReservationData {

    public static readonly NO_ROOM = 'NO_ROOM';

    readonly id: string;
    readonly start: LocalDateTime;
    readonly end: LocalDateTime;
    readonly fixed: boolean;
    readonly kategorieId: string;
    readonly roomId?: string;

    constructor(data: ReservationData) {

        if (!data) {
            throw new Error(`${Reservation.name} needs data`);
        }

        this.id = data.id;
        this.start = data.start;
        this.end = data.end;
        this.fixed = data.fixed;
        this.kategorieId = data.kategorieId;
        this.roomId = data.roomId;

        if (this.end <= this.start) {
            throw new Error(`End date has to be after start date!`);
        }
        if (!this.kategorieId) {
            /* In theory I would not need a kategorie if I get a roomId but that would mean
            I would need a Property to get the kategorie of a room, or I would need a
            room instance. It seems easier to provide the kategorie as well when providing
            a roomid for now */
            throw new Error(`A reservation needs at least a Kategorie`);
        }

    }

    cloneWithNewRoomId(roomId: string) {

        const newRes = new Reservation({
            id: this.id,
            start: this.start,
            end: this.end,
            fixed: this.fixed,
            kategorieId: this.kategorieId,
            roomId: roomId,
        });

        return newRes;

    }


}
