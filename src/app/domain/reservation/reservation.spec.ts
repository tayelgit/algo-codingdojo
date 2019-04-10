import { LocalDateTime, ChronoUnit } from 'js-joda';
import { Reservation } from './reservation';

describe('Reservation', () => {

  it('should work with kategorie and room', () => {

    const testDate1 = LocalDateTime.now();
    const testDate2 = testDate1.plus(2, ChronoUnit.DAYS);

    const res = new Reservation({
      id: 'resid',
      fixed: false,
      start: testDate1,
      end: testDate2,
      kategorieId: 'kat',
      roomId: 'room'
    });
    expect(res.id).toEqual('resid');
    expect(res.fixed).toEqual(false);
    expect(res.start).toEqual(testDate1);
    expect(res.end).toEqual(testDate2);
    expect(res.kategorieId).toEqual('kat');
    expect(res.roomId).toEqual('room');
  });

  it('should work with kategorie and without room', () => {

    const testDate1 = LocalDateTime.now();
    const testDate2 = testDate1.plus(2, ChronoUnit.DAYS);

    const res = new Reservation({
      id: 'resid',
      fixed: false,
      start: testDate1,
      end: testDate2,
      kategorieId: 'kat'
    });
    expect(res.id).toEqual('resid');
    expect(res.fixed).toEqual(false);
    expect(res.start).toEqual(testDate1);
    expect(res.end).toEqual(testDate2);
    expect(res.kategorieId).toEqual('kat');
    expect(res.roomId).toBeUndefined();
  });

});
