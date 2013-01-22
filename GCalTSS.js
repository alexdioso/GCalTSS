/*
 *  GCalTSS.js - Time Spent Summary gadget for Google Calendar.
 *  Copyright (C) 2012  Alex Dioso (alex.dioso@ikaika.org)
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * Requires jQuery to be loaded before this script
 * Then this script should be loaded with
 * gadgets.util.registerOnLoadHandler(function(){ikaika(__MODULE_ID__)});
 */
var ikaika = (function(my) {

    if (my === undefined) {
        my = {};
    }

    var groups = {};
    var totalTime = 0;

    // Provide variables for commonly used things so they can be optimized by
    // the closure compiler
    //var mSqrt = Math['sqrt'];
    var container;
    var animate = 'animate';

    // Supported skin properties
    // http://code.google.com/apis/blogger/docs/gadgets/gadgets_for_blogger.html#BestUIPractices
    //var gSkinsGetProp = gadgets['skins']['getProperty'];
    //var fontFace = gSkinsGetProp('FONT_FACE');

    /*
     * Performs all the setup for the gadget, gets list of labels from the
     * blog's feed, arranges them around a sphere, and sets event handlers to
     * rotate the sphere based on mouse position.
     */
    my.init = function(moduleId) {

        // Status messages
        var msg = new gadgets['MiniMessage'](moduleId);

        // If the gadget is not being used on Calendar
        if (!google['hasOwnProperty']('calendar')){
            var hasOwnPropMsg =
                msg['createStaticMessage']("GCalTSS only works in Calendar");
            return;
        }

        // Display a loading status message to let the user know something is
        // happening
        var loadMessage = msg['createStaticMessage']("Loading...");

        container = $('#ikaika-container');

        // Animate the div containing the ikaika link
        $('#ikaika')['hover']( ikaikaHoverIn, ikaikaHoverOut);

        google.calendar.subscribeToDates(datesCallback);
        msg['dismissMessage'](loadMessage);
    };

    /*
     * Increase fontsize and opacity of an object when the mouse is over it
     */
    function ikaikaHoverIn() {
        $(this)[animate]({
            opacity: '1',
            fontSize: '100%'
        },
        'fast');
    }

    /*
     * Decrease fontsize and opacity of an object when the mouse isn't over it
     */
    function ikaikaHoverOut() {
        $(this)[animate]({
            opacity: '.5',
            fontSize: '70%'
        },
        'fast');
    }

    function errorMessage(txt) {
        msg['dismissMessage'](loadMessage);
        var errorMsg = msg['createStaticMessage'](txt);
    }

    function datesCallback(dates) {
        var start = dates.startTime;
        var end = dates.endTime;
        end.hour = 23;
        end.minute = 59;
        google.calendar.read.getEvents(eventsCallback, "selected", start, end);
    }

    function eventsCallback(calendars) {
        var numCalendars = calendars.length;
        totalTime = 0;
        container.empty();

        for (var prop in groups) {
            delete groups[prop];
        }

        for (var i = 0; i < numCalendars; i += 1) {
            if (calendars[i]['events'].length > 0) {
                createGroup(calendars[i]);
            }
        }

        var percentage = 0;
        var html;
        var totalPercentage = 0;
        var prop;
        for (prop in groups) {
            if (groups[prop].hasOwnProperty('obj')) {
                percentage = Math.round((groups[prop]['time'] / totalTime) * 100);
                totalPercentage += percentage;
                html = groups[prop]['obj'].html();
                groups[prop]['obj'].html(html+"<span class='percentage'>"+percentage+"%</span>");
            }
        }

        totalPercentage -= percentage;
        percentage = 100 - totalPercentage;
        groups[prop]['obj'].html(html+"<span class='percentage'>"+percentage+"%</span>");
    }

    function createGroup(group) {
        groups[group['name']] = new Object();
        //groups[group['name']].css('background-color', 'red');

        var time = 0;
        var start;
        var end;
        var events = group['events'];
        var numEvents = events.length;

        for (var i = 0; i < numEvents; i += 1) {
            start = google.calendar.utils.toDate(events[i].startTime);
            end = google.calendar.utils.toDate(events[i].endTime);
            time += end.getTime() - start.getTime();
        }

        groups[group['name']]['obj'] = container.append("<div><span>"+group['name']+":</span> </div>").children().last();
        groups[group['name']]['time'] = time;
        groups[group['name']]['color'] = events[0].palette.lightest;
        groups[group['name']]['obj'].css('background-color', groups[group['name']]['color']);
        totalTime += time;
    }

    return my;
} (ikaika));
