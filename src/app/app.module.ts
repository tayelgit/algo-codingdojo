import { BrowserModule } from '@angular/platform-browser';
import { AlgoTestState, rootReducer, INITIAL_STATE } from './redux/store';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AlgoYamlInputComponent } from './components/algo-yaml-input/algo-yaml-input.component';

import { CodemirrorModule } from '@ctrl/ngx-codemirror';

// redux
import { NgRedux, NgReduxModule } from '@angular-redux/store';

// from https://www.npmjs.com/package/ngx-highlightjs
import { AlgoGuiVisComponent } from './components/algo-gui-vis/algo-gui-vis.component';
import { FormsModule } from '@angular/forms';
import { OptimizerService } from './services/optimizer.service';

import { HttpClientModule } from '@angular/common/http';

// angular material
import {MatExpansionModule} from '@angular/material/expansion';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent
    , AlgoYamlInputComponent    // text field for yaml input
    , AlgoGuiVisComponent       // drawing of the original rooms/days
  ],
  imports: [
    // tslint:disable-next-line:max-line-length
    BrowserModule,            // always needed, for example to be able to use directives like *ngFor or *ngIf in templates
                              // (seems like order is important (Ang.Material imports need to be after this) so always import this first)
    FormsModule,              // Was necessary for CodeMirror
    NgReduxModule,            // redux
    CodemirrorModule,         // syntax highlighting text area / code editor
    HttpClientModule,         // eg to read yaml file from server
    BrowserAnimationsModule,  // necessary for angular material
    MatExpansionModule,       // to fold the log of the evaluator score
    MatSelectModule
  ],
  providers: [
    OptimizerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(
    private ngRedux: NgRedux<AlgoTestState>
  ) {
    ngRedux.configureStore(rootReducer, INITIAL_STATE);
  }

}
