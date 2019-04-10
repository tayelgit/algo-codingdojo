import { convert } from 'js-joda';
import { VisZoomService } from './../../services/vis-zoom.service';
import { Property } from './../../domain/immo/property';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, Input } from '@angular/core';
import { Timeline } from 'vis';
import { Observable } from 'rxjs';
import { Reservation } from 'src/app/domain/reservation/reservation';
import { SmapTimelineOptions } from 'src/app/visjs/visjs-options';

interface TimelineData {
  timeline: Timeline;
  div: HTMLDivElement;
}

@Component({
  selector: 'smapalgo-algo-gui-vis',
  templateUrl: './algo-gui-vis.component.html',
  styleUrls: ['./algo-gui-vis.component.css']
})
export class AlgoGuiVisComponent implements OnInit {

  @ViewChild('divVisualization')
  divVisViewChild: ElementRef;

  /** select is a redux annotation to select this Observable from the state object of the redux store */
  @Input() propertyObservable: Observable<Property>;
  @Input() reservationsObservable: Observable<Reservation[]>;

  property: Property;
  private reservations: Reservation[];

  private divVis: HTMLDivElement;

  private timelines: Map<string, TimelineData>;

  constructor(
    private renderer: Renderer2               // to change html dom (eg add Zimmerkategorie titles between timelines)
    , private visZoomService: VisZoomService  // one service that centralizes zooming
  ) {

  }

  ngOnInit() {
    this.divVis = this.divVisViewChild.nativeElement;
    this.timelines = new Map();

    if (!this.propertyObservable) {
      throw new Error(AlgoGuiVisComponent.name + ' needs a propertyObservable');
    }
    if (!this.reservationsObservable) {
      throw new Error(AlgoGuiVisComponent.name + ' needs reservationsObservable');
    }

    // console.log('obs?', this.propertyObservable);

    // subscribe to store updates
    this.propertyObservable.subscribe((newProperty) => {
      this.property = newProperty;
      this.redraw();
    });
    this.reservationsObservable.subscribe((newReservations) => {
      this.reservations = newReservations;
      this.redraw();
    });

    this.redraw();
  }

  private redraw(): void {

    if (!this.timelines) {
      console.log(this + ' initiaization not finished...can\'t redraw yet');
      return;
    }

    // to know which older timelines to remove
    const cleanupKats = Array.from(this.timelines.keys());

    Array.from(this.property.getKategories()).forEach(katName => {

      // transform data to vis js format
      const visDataGroups = this.getVisGroups(katName);
      const visDataItems = this.getVisItems(katName);

      // remove this kat from the cleanup array (to not get cleaned up afterwards)
      cleanupKats.splice( cleanupKats.indexOf(katName), 1 );

      // build/render timelines
      let tlData = this.timelines.get(katName);
      if (!tlData) {

        // build a div per timeline to be able to remove it on updates
        const divTL =  this.renderer.createElement('div');
        const h3 = this.renderer.createElement('h3');
        const text = this.renderer.createText(katName);
        this.renderer.appendChild(h3, text);
        this.renderer.appendChild(divTL, h3);
        this.renderer.appendChild(this.divVis, divTL);

        // initialize new timeline graph
        const tl = new Timeline(
          divTL,    // the div to add the timeline to
          visDataItems,   // reservations
          visDataGroups,  // rooms
          Object.assign({}, SmapTimelineOptions, {})  // generic TimelineOptions merged with custom options for this component
        );
        // listen for range changes to synchronize all other timelines to this one
        // TODO add timeline range service and add all timelines to do this over all components
        this.visZoomService.addTimeline(tl);
        tlData = {
          timeline: tl,
          div: divTL
        };
        this.timelines.set(katName, tlData);

      } else {
        // update existing timeline graph
        tlData.timeline.setData({
          groups: visDataGroups,
          items: visDataItems
        });
      }

      // destroy older timelines
      cleanupKats.forEach(k => {
        tlData = this.timelines.get(k);

        if (!tlData) {
          console.warn(`Wanted to remove timeline for ${k} but found no such timeline.`);
          return;
        }

        // remove div from page
        tlData.div.remove();
        // remove timeline as zoom event consumer
        this.visZoomService.removeTimeline(tlData.timeline);
        // delete entry in timeline map
        this.timelines.delete(k);

        // console.log(`Removed ${k} as it is not part of the property anymore!`);
      });

    });
  }

  private getVisItems(katName: string) {
    const visDataItems = [];
    if (this.reservations) {
      this.reservations.forEach(res => {
        if (res.kategorieId !== katName) {
          return;
        }
        visDataItems.push({
          id: res.id,
          start: convert(res.start).toDate(),
          end: convert(res.end).toDate(),
          content: res.id,
          group: res.roomId ? res.roomId : 'NoRoom'
        });
      });
    }
    return visDataItems;
  }

  private getVisGroups(katName: string) {
    const visDataGroups = [{ id: 'NoRoom', content: 'NoRoom' }];
    Array.from(this.property.getRoomsOfKat(katName)).forEach(room => {
      visDataGroups.push({ id: room.id, content: room.id });
    });
    return visDataGroups;
  }

}
