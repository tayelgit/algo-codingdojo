import { LocalDateTime, ChronoUnit } from 'js-joda';
export class RandomReservationsGenerator {

    private static NAMES = [
        'Hailey Clay',
        'Marshall Nicholson',
        'Deven Dickerson',
        'Jason Mclean',
        'Thaddeus Jackson',
        'Hope Weiss',
        'Amani Spencer',
        'Maximo Salas',
        'Alexus Davidson',
        'Ryann Owens',
        'Marcos Chang',
        'Caitlyn Monroe',
        'Deon Wells',
        'Britney Aguilar',
        'Cheyanne Baird',
        'Martin Chan',
        'Kailee Allen',
        'Ryan Olson',
        'Braydon Forbes',
        'Savanna Mason',
        'Alden Bullock',
        'Gillian Chapman',
        'Asa Charles',
        'Vaughn Leblanc',
        'Taryn Abbott',
        'Elianna Huerta',
        'Callum Daniel',
        'Madeleine Hammond',
        'Micaela Benson',
        'Itzel Gibbs',
        'Rylee Olsen',
        'Micah Garrison',
        'Reginald Willis',
        'Colin Landry',
        'Pablo Huang',
        'King Powers',
        'Josephine Grimes',
        'Tyrell Richardson',
        'Leo Valdez',
        'Matthew Carpenter',
        'Misael Valenzuela',
        'Franco Estes',
        'Emerson Brennan',
        'Briley Houston',
        'Brisa Escobar',
        'Kasen Atkinson',
        'Abagail Villarreal',
        'Kareem Beasley',
        'Evelyn Clayton',
        'Quinn Garcia',
        'Porter Parsons',
        'Scott Dean'
        ];

    private static getRandomName(): string {
        return this.NAMES[Math.trunc(Math.random() * this.NAMES.length)];
    }

    public static getRandomReservationsYaml(): string {
        const nrOfRooms = 35;
        const nrOfReservations = 100;

        let result = `
property:
  kat1:`;

        for (let i = 0; i < nrOfRooms; i++) {
        result += `
    - room${i + 1}`;
        }
        result += `
reservations:
`;



        for (let i = 0; i < nrOfReservations; i++) {
            const dStart = LocalDateTime.of(2020, 1, Math.round(Math.random() * 30) + 1); // 1-31 instead of 0-30
            const dEnd = dStart.plus(Math.round(Math.random() * 14) + 1, ChronoUnit.DAYS);
            const res = `
    res${i} - ${this.getRandomName()}:
      kat: kat1
      from: ${dStart.toLocalDate()}
      to: ${dEnd.toLocalDate()}
  `       ;
            result += res;
        }

        return result;
    }

}
