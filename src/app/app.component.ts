import { AlgoEvaluatorV1 } from './algo/evaluation/algo-evaluator-v1';
import { AlgoEvaluator, EvaluationResult } from './algo/evaluation/algo-evaluator';
import { VisZoomService } from './services/vis-zoom.service';
import { OptimizerResult } from './algo/ReservationOptimizer';
import { AlgoTestState, ReduxActions } from './redux/store';
import { Property } from './domain/immo/property';
import { Component, OnInit } from '@angular/core';
import { select, NgRedux } from '@angular-redux/store';
import { Observable, empty } from 'rxjs';
import { Reservation } from './domain/reservation/reservation';
import { OptimizerService } from './services/optimizer.service';
import { map, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'smapalgo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @select('property') origProperty$: Observable<Property>;
  @select('reservations') origReservations$: Observable<Reservation[]>;
  @select('optimizerResult') optimizerResult$: Observable<OptimizerResult>;

  successfulReservations$: Observable<Reservation[]>;
  problematicReservations$: Observable<Reservation[]>;
  evaluationResult$: Observable<EvaluationResult>;

  private origProperty: Property;
  private origReservations: Reservation[];

  optimizerError = null;
  evaluationResult: EvaluationResult;
  showOptimizerResult = false;

  private algoEvaluator: AlgoEvaluator = new AlgoEvaluatorV1();

  constructor(
    private optimizerService: OptimizerService,
    private ngRedux: NgRedux<AlgoTestState>,
    private zoomService: VisZoomService
  ) {}

  ngOnInit(): void {

    // subscribe to store updates
    this.origProperty$.subscribe((newProperty) => {
      this.origProperty = newProperty;
    });
    this.origReservations$.subscribe((newReservations) => {
      this.origReservations = newReservations;
      this.optimize();
    });
    this.successfulReservations$ = this.optimizerResult$.pipe(
      map(optimizerResult => optimizerResult ? optimizerResult.successfulReservations : null)
    );
    this.problematicReservations$ = this.optimizerResult$.pipe(
      map(optimizerResult => optimizerResult ? optimizerResult.problematicReservations : null)
    );

  }

  optimize() {

    // TODO only update on property/reservationchanges?!
    if (this.origProperty && this.origReservations && this.origReservations.length > 0) {
      // lazy load the evaluator as soon as all necessary data is available
      console.log('loading evaluator...');
      this.evaluationResult$ = this.algoEvaluator.evaluate$(this.origProperty, this.origReservations, this.optimizerResult$).pipe(
        tap(evRes => this.evaluationResult = evRes)
      );
    }

    try {

      /** using the optimizerService */
      this.optimizerService.optimize({
        property: this.origProperty,
        reservations: this.origReservations
      })

      /** catch errors of the optimizer to display them in the GUI */
      .pipe(
        catchError(e => {
          this.optimizerError = e;
          this.showOptimizerResult = false;
          console.error(e);
          return empty();
        })
      )

      /** subscribe to the results that don't throw an error */
      .subscribe(optimizerResult => {
        try {
          /** write the result of the optimizer into the store */
          this.ngRedux.dispatch({
            type: ReduxActions.NEW_OPTIMIZATION,
            optimizerResult: optimizerResult
          });
          this.optimizerError = null;
          this.showOptimizerResult = true;
        } catch (e) {
          /** display errors thrown by the store as well*/
          this.optimizerError = e;
          console.error(e);
        }
      });

    } catch (e) {
      // tslint:disable-next-line:max-line-length
      this.optimizerError = new Error(`An internal error occurred (seems like it's not a problem with the optimization code). Have a look in the console.`);
      console.error(e);
    }
  }

  normalize() {
    console.log('norm');
    this.zoomService.showAll();
  }
}
