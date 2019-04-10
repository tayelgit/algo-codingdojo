import { LocalDateTime, nativeJs } from 'js-joda';
import { ReservationUtils } from './../../domain/reservation/reservation-utils';
import { Room } from './../../domain/immo/room';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { Property } from './../../domain/immo/property';
import { AlgoTestState, ReduxActions } from './../../redux/store';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs';
import { Reservation } from 'src/app/domain/reservation/reservation';
import { safeLoad } from 'js-yaml';
import { HttpClient } from '@angular/common/http';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';

@Component({
  selector: 'smapalgo-algo-yaml-input',
  templateUrl: './algo-yaml-input.component.html',
  styleUrls: ['./algo-yaml-input.component.css']
})
export class AlgoYamlInputComponent implements OnInit {

  // @ViewChild('taYamlInput')
  // txtArea: ElementRef;

  @ViewChild('divSyntaxError')
  divError: ElementRef;

  @ViewChild('codeEditor')
  codemirrorComponent: CodemirrorComponent;

  yamlFiles = [
   'sprint1_1.yml',
   'sprint1_2.yml',
   'sprint2_1.yml',
   'sprint3_1.yml',
   'sprint2_2.yml',
   'sprint4_1.yml',
   'sprint4_2.yml'
  ];

  // first is selected at start
  yamlInputFile = this.yamlFiles[0];

  yamlContent: string;

  @select() property$: Observable<Property>;
  @select() reservations$: Observable<Reservation[]>;

  // private taYamlInput: HTMLTextAreaElement;
  // private divSyntaxError: HTMLDivElement;

  syntaxErrorOrig = null;

  constructor(
    private ngRedux: NgRedux<AlgoTestState>,
    private http: HttpClient
  ) {
    this.inputFileSelected();
  }

  ngOnInit() {
    // this.taYamlInput = this.txtArea.nativeElement;
    // this.taYamlInput = this.codemirrorComponent.ref.nativeElement;
    // this.divSyntaxError = this.divError.nativeElement;
    this.update(); // auto update after init
  }

  inputFileSelected() {
    if (!this.yamlInputFile || this.yamlInputFile.length === 0) {
      const msg = `Input filename is '${this.yamlInputFile}'`;
      console.error(msg);
      this.syntaxErrorOrig = msg;
      return;
    }

    this.http.get('/assets/coding-dojo/' + this.yamlInputFile, {responseType: 'text'}).subscribe(resp => {
      this.yamlContent = resp;
      this.update();
    });

  }

  update(): void {
    if (!this.yamlContent || this.yamlContent.length === 0) {
      console.log('No yaml content yet');
      return;
    }

    let doc = null;
    try {
      doc = safeLoad(this.yamlContent);
    } catch (e) {
      console.error(e);
      this.syntaxErrorOrig = e;
      return;
    }


    try {
      const newProperty = this.getPropertyFromYamlInput(doc);
      const newReservations = this.getReservationsFromYamlInput(doc);

      // console.log(new ReservationsContainer(newReservations));

      ReservationUtils.checkData(newReservations, newProperty);

      this.ngRedux.dispatch({
        type: ReduxActions.NEW_INPUT,
        reservations: newReservations,
        property: newProperty
      });

      // everything ok
      this.syntaxErrorOrig = null;

    } catch (e) {
      this.syntaxErrorOrig = e;
      console.error(e);
    }

  }

  private getPropertyFromYamlInput(doc: any): Property {
    if (!doc) {
      console.error('Can\'t get Property from ' + doc);
      return;
    }


    const kategorienFromDoc = doc.property;
    if (!kategorienFromDoc) {
      console.error('Keine Zimmerkategorien in rooms!');
      return;
    }

    const roomObjs = new Array<Room>();

    const kategorien = Object.keys(kategorienFromDoc);
    kategorien.forEach((katName: string) => {
      const rooms = kategorienFromDoc[katName];

      if (!rooms) {
        console.error('Keine Räume in ' + katName + '!');
      } else {
        rooms.forEach((room: any) => {
          roomObjs.push(new Room(room, katName));
        });
      }
    });

    return new Property(roomObjs);
  }

  private getReservationsFromYamlInput(doc: any): Reservation[] {
    if (!doc) {
      console.error('Can\'t get Reservations from ' + doc);
      return;
    }

    const reservationsFromDoc = doc.reservations;
    if (!reservationsFromDoc) {
      console.error('Keine Reservierungen in reservations!');
      return;
    }

    const reservationObjs = new Array<Reservation>();

    const reservationNames = Object.keys(reservationsFromDoc);
    reservationNames.forEach((resName: string) => {
      const resObjFromDoc = reservationsFromDoc[resName];

      if (!resObjFromDoc) {
        console.error('Keine Reservierungsdaten in ' + resName + '!');
      } else {
        reservationObjs.push(new Reservation({
          id: resName,
          start: this.getCheckInTime(resObjFromDoc.from),
          end: this.getCheckOutTime(resObjFromDoc.to),
          fixed: false,
          kategorieId: resObjFromDoc.kat,
          roomId: resObjFromDoc.room
        }));
      }
    });

    return reservationObjs;
  }

  private getCheckInTime(nativeJsDate: any): LocalDateTime {
    const d = LocalDateTime.from(nativeJs(nativeJsDate));
    return d.withHour(12);
  }

  private getCheckOutTime(nativeJsDate: any): LocalDateTime {
    const d = LocalDateTime.from(nativeJs(nativeJsDate));
    return d.withHour(12);
  }

}
