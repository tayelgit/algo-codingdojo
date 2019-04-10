import { TimelineOptions } from 'vis';

export const SmapTimelineOptions: TimelineOptions = {

    // show titles as tooltip (items and groups have titles)
    showTooltips: true,

    // set to true to show a moving red line at the current time
    showCurrentTime: false,

    // don't wrap room rows if reservations are too close together
    // https://stackoverflow.com/a/33757625/7869582
    margin: {
        item : {
            horizontal : -1, // necessary to not stack reservations of same room when end time of res1 == start time of res2
            vertical: 0
        }
    }
};
