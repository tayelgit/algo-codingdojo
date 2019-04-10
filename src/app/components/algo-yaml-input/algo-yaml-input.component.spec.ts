/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By, BrowserModule } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AlgoYamlInputComponent } from './algo-yaml-input.component';
import { AppComponent } from 'src/app/app.component';
import { AlgoGuiVisComponent } from '../algo-gui-vis/algo-gui-vis.component';
import { FormsModule } from '@angular/forms';
import { NgReduxModule } from '@angular-redux/store';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { HttpClientModule } from '@angular/common/http';
import { OptimizerService } from 'src/app/services/optimizer.service';

describe('AlgoYamlInputComponent', () => {
  let component: AlgoYamlInputComponent;
  let fixture: ComponentFixture<AlgoYamlInputComponent>;

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
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlgoYamlInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
