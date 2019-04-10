import { Room } from './room';

export class Property {

    private readonly roomsByKategory: Map<string, Room[]>;
    private readonly kategoryByRoom: Map<string, string>;

    constructor (readonly rooms: Room[]) {
        if (!rooms || rooms.length === 0) {
           throw new Error('You need to initialize the Property with rooms...it\'s immutable.');
        }

        this.roomsByKategory = new Map<string, Room[]>();
        this.kategoryByRoom = new Map<string, string>();
        rooms.forEach(r => {
            const kat = r.kategorieId;
            const formerKatEntry = this.roomsByKategory.get(kat);
            const formerRoomEntry = this.kategoryByRoom.get(r.id);
            if (formerRoomEntry) {
                throw new Error(`Can't add two rooms with the same id ${r.id} in one property!`);
            } else {
                this.kategoryByRoom.set(r.id, kat);
            }

            if (!formerKatEntry) {
                this.roomsByKategory.set(kat, [r]);
            } else {
                formerKatEntry.push(r);
            }
        });

    }

    public getKategories(): IterableIterator<string> {
        return this.roomsByKategory.keys();
    }

    public getRoomsOfKat(katId: string): IterableIterator<Room> {
        return this.roomsByKategory.get(katId).values();
    }

    public getKategoryOfRoom(roomId: string): string {
        return this.kategoryByRoom.get(roomId);
    }

}
