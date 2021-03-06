// next steps:
// lineOptions vs tempOptions is confusing

$(document).ready(function () {

  //load needed packages from Google:
  try {
    google.charts.load('current', { packages: ['corechart', 'line'] });
  } catch (e) {
    $('#chart-error-div').addClass('alert alert-warning').show();
    $('#chart-error-text').text('Can\'t load the Google Charts package. Are you connected to the internet?');
    return;
  }

  //global variables:
  var colorList = [null, '#2C3E50', '#18BC9C', '#3498DB', '#F39C12', '#E74C3C', 'darkblue'];
  var initialLineOptions = {
    colors: colorList,
    hAxis: {
      format: 'EEE, MMM d',
      gridlines: { count: 8 },
      viewWindow: {}
    },
    vAxis: {
      gridlines: { count: 6 },
      viewWindowMode: 'pretty',
      viewWindow: {
        min: 0,
        max: 10
      }
    },
    titleTextStyle: {
      fontName: 'Droid Serif',
      fontSize: 24
    },
    legend: {
      position: 'top',
      alignment: 'center',
    },
    height: 320,
    lineWidth: 3,
    focusTarget: 'datum',
    pointSize: 7,
    animation: {
      startup: true,
      duration: 500,
      easing: 'out'
    },
    chartArea: {
      height: '70%',
      top: 50,
      left: 50,
      width: '90%'
    },
    fontSize: 18,
    fontName: 'Droid Sans',

    // Drag-to-pan isn't working as of May 2016, due to a bug on Google's end. Maybe in the future? (If so, add it to column options too)
    // explorer: {
    //   actions: ['dragToPan'],
    //   axis: 'horizontal',
    //   keepInBounds: true
    // }
  };

  var initialColOptions = {
    bar: { groupWidth: 70 },
    hAxis: {
      gridlines: { count: 0 },
      viewWindow: {}
    },
    vAxis: {
      gridlines: { count: 0 },
      viewWindow: {
        min: 0,
        max: 1
      }
    },
    height: 60,
    focusTarget: 'datum',
    animation: {
      startup: true,
      duration: 500,
      easing: 'out'
    },
    chartArea: {
      height: '70%',
      top: 50,
      left: 50,
      width: '90%'
    },
    fontSize: 18,
    fontName: 'Droid Sans',
    annotations: {
        textStyle: {
          fontName: 'Droid Sans',
          fontSize: 40,
          bold: true
        }
      }
  };

  //Create some fake data in the correct format:
  function fudgeData(days) {
    var i;
    var outputArray = [];
    var dateArray = [];
    var today = new Date(2016, 4, 10);
    for (i = 0; i < days; i++) {
      var datesList;
      datesList = today.setDate(today.getDate() - 1);
      dateArray.push(datesList);
    }

    for (i = 0; i < days; i++) {
      var med = Math.round(Math.random() + 0.2);
      var ex = Math.round(Math.random() + 0.2);
      var fudge = [new Date(dateArray[i]), Math.min(i + 6, 10), Math.floor(Math.random() * 10 + 1), 5, Math.max(7 - i, 0), Math.floor(Math.random() * 10 + 1), Math.floor(Math.random() * 10 + 1), 0, 0];
      if (med) {
        fudge.push('\u2713');
      } else {
        fudge.push(null);
      }

      if (ex) {
        fudge.push('\u2713');
      } else {
        fudge.push(null);
      }

      outputArray.push(fudge);
    }

    return outputArray;
  }

  //Create the DataTable. This object won't change once created. (Its DataView will.)
  function createTable(dataArray) {
    var data = new google.visualization.DataTable();
    data.addColumn('date', 'X');
    data.addColumn('number', 'Cravings');
    data.addColumn('number', 'Sleep');
    data.addColumn('number', 'Stress');
    data.addColumn('number', 'Mood');
    data.addColumn('number', 'Energy');
    data.addColumn('number', 'Goals');
    data.addColumn('number', 'Meditated');
    data.addColumn('number', 'Exercised');
    data.addColumn({ type: 'string', role: 'annotation' });
    data.addColumn({ type: 'string', role: 'annotation' });
    data.addRows(dataArray);
    return data;
  }

  // Generic debounce function. Used below to slow chart re-draw on window resize
  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var _this = this;
      var args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) {
          func.apply(_this, args);
        }
      };

      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(_this, args);
      }
    };
  }

  function initializeCharts(dataArray, lineOptions, colOptions) {
    var data = createTable(dataArray);

    //the Data View is the object that mutates with form input:
    var filteredLineData = new google.visualization.DataView(data);
    var exerciseData = new google.visualization.DataView(data);
    var meditateData = new google.visualization.DataView(data);

    // set the columns for each of the col charts. (the line chart's columns are set dynamically by form input)
    exerciseData.setColumns([0, 7, 9]);
    meditateData.setColumns([0, 8, 10]);

    var lineChart = new google.visualization.LineChart(document.getElementById('line-chart'));
    var exerciseChart = new google.visualization.ColumnChart(document.getElementById('exercise-chart'));
    var meditateChart = new google.visualization.ColumnChart(document.getElementById('meditate-chart'));

    var viewWidth = 7;
    var finalDate;
    var earliestDate;

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    //Some functions to handle changes to date range from user input. (Event listeners at bottom of initializeLineCharts.)
    function resetDates() {
      finalDate = new Date(dataArray[0][0].getTime());
      earliestDate = new Date(finalDate.getTime());
      earliestDate.setDate(earliestDate.getDate() - (viewWidth - 1));
    }

    function goPast() {
      earliestDate.setDate(earliestDate.getDate() - viewWidth);
      finalDate.setDate(finalDate.getDate() - viewWidth);
      drawCharts(findActiveColumns());
    }

    function goFuture() {
      earliestDate.setDate(earliestDate.getDate() + viewWidth);
      finalDate.setDate(finalDate.getDate() + viewWidth);
      drawCharts(findActiveColumns());
    }

    function updateDateDisplay() {
      var earliestString = months[earliestDate.getMonth()] + ' ' + earliestDate.getDate();
      var finalString = months[finalDate.getMonth()] + ' ' + finalDate.getDate();
      var rangeString = earliestString + ' - ' + finalString;
      $('#date-range').text(rangeString);
    }

    //check status of column selector buttons on form:
    function findActiveColumns() {
      var $selector = $('#toggle-categories');
      var visibleCols = [0];
      $selector.children().children().each(function () {
        if ($(this).prop('checked')) {
          visibleCols.push(parseInt($(this).prop('id').substring(3)));
        }
      });

      return visibleCols;
    }

    //draw (or update) all 3 charts:
    function drawCharts(cols) {
      filteredLineData.setColumns(cols);

      $('#go-future').removeClass('disabled');
      if (finalDate >= dataArray[0][0]) {
        $('#go-future').addClass('disabled');
        resetDates();
      }

      lineOptions.hAxis.viewWindow.max = finalDate;
      colOptions.hAxis.viewWindow.max = finalDate;
      lineOptions.hAxis.viewWindow.min = earliestDate;
      colOptions.hAxis.viewWindow.min = earliestDate;

      var tempOptions = lineOptions;
      var tempColors = [];

      //start loop at 1 to ignore the null color for x-values (dates)
      for (var i = 1; i < cols.length; i++) {
        tempColors.push(colorList[cols[i]]);
      }

      tempOptions.colors = tempColors;

      // According to the Google documentation, I shouldn't need to use the
      // toDataTable method, but I get an error message without it (as far as
      // I can tell, this is a bug in the library)
      updateDateDisplay();
      lineChart.draw(filteredLineData.toDataTable(), tempOptions);

      //draw the column charts (their options are identical except for color, which needs to be manually updated):
      colOptions.annotations.textStyle.color = '#176AB0';
      exerciseChart.draw(exerciseData.toDataTable(), colOptions);

      colOptions.annotations.textStyle.color = '#18BC9C';
      meditateChart.draw(meditateData.toDataTable(), colOptions);
    }

    // ~~~~~~~Event Listeners:~~~~~~~~~ //

    //redraw when window resized:
    $(window).on('resize', debounce(
      function () {
        drawCharts(findActiveColumns());
      },

      150, false));

    //listen for control panel input:
    $('#toggle-categories').on('change', function () {
      drawCharts(findActiveColumns());
    });

    $('#go-past').on('click', function () {
      goPast();
    });

    $('#go-future').on('click', function () {
      goFuture();
    });

    $('#jump-size-picker').on('click', function (e) {
      switch (e.target.id) {
        case 'jump-7':
          viewWidth = 7;
          $('#go-past').removeClass('disabled');
          break;
        case 'jump-30':
          viewWidth = 30;
          $('#go-past').removeClass('disabled');
          break;
        case 'jump-all':
          viewWidth = dataArray.length;
          finalDate = new Date(dataArray[0][0].getTime());
          $('#go-past').addClass('disabled');
          break;
      }

      //Need to modify a function-scoped variable, not the relatively global date variable:
      var tempEarliest = new Date(finalDate.getTime());
      tempEarliest.setDate(finalDate.getDate() - (viewWidth - 1));
      earliestDate = tempEarliest;
      drawCharts(findActiveColumns());
    });

    //keyboard controls:
    $(window).on('keydown', function (e) {
      switch (e.which) {
        case 37:
          e.preventDefault();
          goPast();
          break;
        case 39:
          e.preventDefault();
          goFuture();
          break;
      }
    });

    //listen for swipes on mobile:
    $('#line-chart').on('swipeleft', function () {
      goFuture();
    });

    $('#line-chart').on('swiperight', function () {
      goPast();
    });

    // ~~~~~~~End event listeners~~~~~~~//

    //initial draw:
    resetDates();
    drawCharts(findActiveColumns());
  }

  google.charts.setOnLoadCallback(function () {
    initializeCharts(fudgeData(80), initialLineOptions, initialColOptions);
  });
});

