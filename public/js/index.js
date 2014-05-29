moment.lang('en', {
    relativeTime : {
        future: "%s",
        past:   "%s ago",
        s:  "a jiff",
        m:  "%d min",
        mm: "%d mins",
        h:  "%dh",
        hh: "%dh",
        d:  "a day",
        dd: "%d days",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
    }
});

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
      }
      return undefined;
    }
  });
}

function setDate() {
    $("#date").text(moment().format('ddd, MMMM Do'));
    $("#time").text(moment().format('h:mm a'));
}

$(document).ready(function () {
  setDate();
  setInterval(setDate, 60 * 60 * 1000);
});
