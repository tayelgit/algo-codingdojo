import { LocalDateTime, convert } from 'js-joda';
import { Timeline } from 'vis';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisZoomService {

  private timelines: Timeline[];

  private lastStart: Date;
  private lastEnd: Date;

  constructor() {
    this.timelines = [];
  }

  public addTimeline(tl: Timeline): void {
    if (this.timelines.includes(tl)) {
      console.warn('You tried to add the same instance of Timeline twice! I don\'t add it to the ' + VisZoomService.name);
    } else {
      this.timelines.push(tl);
      if (this.lastStart && this.lastEnd) {
        // set the zoom range of the new timeline to the same range as all others
        tl.setWindow(this.lastStart, this.lastEnd, { animation: false });
      }

      // when this timeline is zoomed...zoom all other timelines as well
      tl.on('rangechange', changes => {
        if (changes.byUser) {
            this.changeWindowOfAllTimelines(changes.start, changes.end);
        }
      });
    }
  }

  removeTimeline(timeline: Timeline): any {
    this.timelines.splice( this.timelines.indexOf(timeline), 1 );
  }

  public showAll() {
    const range = this.getRangeOverAllTimelines();
    this.changeWindowOfAllTimelines(range.min, range.max);
  }

  public zoomTo(start: Date | LocalDateTime, end: Date | LocalDateTime) {
    if (!start || !end) {
      throw new Error(`Makes no sense to zoom from ${start} to ${end}`);
    }

    if (start instanceof Date && end instanceof Date) {
      return this.changeWindowOfAllTimelines(start, end);
    } else {
      return this.changeWindowOfAllTimelines(
        convert(<LocalDateTime>start).toDate(),
        convert(<LocalDateTime>end).toDate()
      );
    }
  }

  private changeWindowOfAllTimelines (start: Date, end: Date) {
    if (!this.timelines) {
      console.warn('RangeChange but no timelines?!');
      return;
    }

    this.lastStart = start;
    this.lastEnd = end;

    this.timelines.forEach((timeline) => {
      timeline.setWindow(start, end, { animation: false });
    });
  }

  private getRangeOverAllTimelines() {
    let min = null;
    let max = null;

    throw new Error('Not possible to normalize as getDataRange is not part of the visjs index.d.ts (timeline)');

    // this.timelines.forEach(tl => {

    //   const w = tl.getDataRange();
    //   if (w.min !== null && (min === null || w.min < min)) {
    //     min = w.min;
    //   }
    //   if (w.max && (max === null || w.max > max)) {
    //     max = w.max;
    //   }
    // });

    return {
      min: min,
      max: max
    };
  }

}

