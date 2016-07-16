//handles all calls to fullCalendar library:
define(function(){
  var exports = {};

  //Draw a calendar with fullcalendar.js:
  exports.draw = function (customOptions, callbacks, colors) {
    var key;

    // Default options object:
    var options = {
      defaultView: 'agendaWeek',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'month,agendaWeek,fourDay,agendaDay'
      },
      views: {
        fourDay: {
          type: 'agenda',
          duration: { days: 4 },
          buttonText: '4-day'
        }
      },
      minTime: '07:00',
      maxTime: '21:00',
      timezone: 'local',
      weekends: true,
      scrollTime: '08:00',
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      droppable: true,
      eventBackgroundColor: colors.bgDefault,
      eventBorderColor: colors.border,
      eventTextColor: colors.text,
      eventOverlap: false,
      allDayDefault: false,
      defaultAllDayEventDuration: { days: 1 }
    };

    //add customOptions, like the events array and user-specific settings:
    for (key in customOptions) {
      if (customOptions.hasOwnProperty(key)) {
        options[key] = customOptions [key];
      }
    }

    //add the callback functions specific to this app:
    for (key in callbacks) {
      if (callbacks.hasOwnProperty(key)) {
        options[key] = callbacks [key];
      }
    }

    $('#calendar').fullCalendar(options);
  };

  exports.deleteEvent = function (id) {
    $('#calendar').fullCalendar('removeEvents', id);
  };

  exports.addGoogleEventId = function (localEventId, googEvent) {
    $('#calendar').fullCalendar('clientEvents', localEventId)[0].googleId = googEvent.id;
  };

  exports.destroy = function () {
    $('#calendar').fullCalendar('destroy');
  };

  return exports;
});