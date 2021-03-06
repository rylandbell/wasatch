//Creates a draggable DOM element with encoded event information
module.exports.Draggable = function (parent, fcEvent) {
  var $parent = $(parent);

  if (typeof fcEvent === 'undefined') {
    fcEvent = {
      title: 'No event title found.',
      backgroundColor: 'lightgrey'
    };
  }

  // add default values for fcEvent:
  if (!fcEvent.duration) {
    fcEvent.duration = '01:00';
  }

  if (!fcEvent.hasOwnProperty('editable')) {
    fcEvent.editable = true;
  }

  var $textArea = $('<div>')
    .addClass('draggable-text')
    .text(fcEvent.title + ' ');

  //create the new draggable DOM element:
  this.$el = $('<div>')
    .addClass('draggable')
    .append($textArea)
    .css('background-color', fcEvent.backgroundColor);

  if (fcEvent.recurrence) {
    $('<div><span class="glyphicon glyphicon-refresh">&nbsp;</span></div>')
      .addClass('draggable-icon')
      .prependTo(this.$el);
  }

  // add draggability via jQuery UI, event data via fullCalendar
  this.$el
    .draggable({
      revert: true,
      revertDuration: 0,
      helper: 'clone',
      opacity: 0.5,
      cursor: 'pointer',
      cursorAt: { top: 33, left: 70 }
    })
    .data('duration', fcEvent.duration)
    .data('event', fcEvent);

  $parent.append(this.$el);

  return this;
};

