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
  setInterval(setDate, 60 * 1000);
  setupOverlay();
});

// Fullscreen support.
function setupOverlay() {
  // Show overlay after mouse move.
  var overlayTimeout;
  document.body.addEventListener('mousemove', function(e) {
    document.body.classList.add('show-overlay');
    clearTimeout(overlayTimeout);
    overlayTimeout = setTimeout(function () {
      document.body.classList.remove('show-overlay');
    }, 3000);
  });
  // Enable fullscreen button.
  setupFullscreen();
}

function setupFullscreen() {
  var contentElem = document.body;

  document.addEventListener('keydown', function (e) {
    // 70 is "f"
    if (e.keyCode === 70) {
      toggleFullScreen(contentElem);
    }
  });
  document.querySelector('#fullscreen').addEventListener('click', function (e) {
    toggleFullScreen(contentElem);
  });
}

function requestFullscreen(elem) {
  (elem.requestFullscreen ||
   elem.msRequestFullScreen ||
   elem.mozRequestFullScreen ||
   elem.webkitRequestFullScreen ||
   function(){}).call(elem, Element.ALLOW_KEYBOARD_INPUT);
}

function cancelFullScreen() {
  (document.exitFullscreen ||
   document.msExitFullscreen ||
   document.mozCancelFullScreen ||
   document.webkitExitFullscreen ||
   function(){}).call(document);
}

function isFullScreen() {
  return !!(document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement);
}

function toggleFullScreen(elem) {
  if (isFullScreen()) {
    cancelFullScreen();
  } else {
    requestFullscreen(elem);
  }
}
