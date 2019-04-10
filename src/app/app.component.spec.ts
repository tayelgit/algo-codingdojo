import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AlgoGuiVisComponent } from './components/algo-gui-vis/algo-gui-vis.component';
import { AlgoYamlInputComponent } from './components/algo-yaml-input/algo-yaml-input.component';
import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NgReduxModule } from '@angular-redux/store';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { HttpClientModule } from '@angular/common/http';
import { OptimizerService } from './services/optimizer.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
        HttpClientModule          // eg to read yaml file from server
      ],
      providers: [
        OptimizerService
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
