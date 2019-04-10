# SmapAlgo

## How to run

Run `ng serve --open`. This should open a browser at  `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Implement your optimizer
Implement optimizeInternal() in src\app\algo\test-optimizer.ts

## Switch between test cases
At the moment you have to un/comment one of the test yml files in the src/app/components/algo-yaml-input/algo-yaml-input.component.ts file

~~~~
  yamlInputFile = '/assets/findRoom1.yml';
  // yamlInputFile = '/assets/findRoom2.yml';
  // yamlInputFile = '/assets/findRoom3.yml';
  // yamlInputFile = '/assets/findRoom4.yml';
  // yamlInputFile = '/assets/findRoom5.yml';
  // yamlInputFile = '/assets/test_2kat.yml';
~~~~

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
