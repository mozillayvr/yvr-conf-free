/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* jshint strict: true, node: true */

"use strict";

// https://www.npmjs.org/package/ical
var ical = require('ical');

var format = require('util').format;
var path = require('path');

var express = require('express');

var moment = require('moment');

var CALENDAR_INTERVAL = 5; // in minutes

var BUSY_FUZZ = 15;

moment.lang('en', {
    relativeTime : {
        future: "in %s",
        past:   "%s ago",
        s:  "a jiff",
        m:  "%dm",
        mm: "%dm",
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

// ICS calendar URL format, first %s requires email, second %s requires date in 20140516 format
// thanks to this: http://www.zimbra.com/forums/users/16877-only-publish-free-busy-information-icalendar.html#post88423
var ics = "https://mail.mozilla.com/home/%s/Calendar?fmt=ifb&date=%s";

// room names and ids for all the Mozilla YVR conference rooms
var rooms = [ { name : "Siwash", id : "2a", neighborhood : "west", vidyo : true, size : 2 },
              { name : "Buntzen", id : "2b", neighborhood : "west", vidyo : false, size : 2 },
              { name : "Deep Cove", id : "2c", neighborhood : "west", vidyo : true, size : 2 },
              { name : "Crazy Raven", id : "2e", neighborhood : "west", vidyo : true, size : 2 },
              { name : "Lighthouse", id : "2d", neighborhood : "east", vidyo : false, size : 1 },
              { name : "Wreck", id : "2f", neighborhood : "east", vidyo : false, size : 1 },
              { name : "Dinky Peak", id : "2g", neighborhood : "east", vidyo : false, size : 1 },
              { name : "Adanac", id : "2h", neighborhood : "east", vidyo : false, size : 1 },
              // not sure I should be including this one
              { name : "Whytecliff", id : "commons", neighborhood : "central", vidyo : true, size : 3 }
            ].map(function(i) { i.freebusy = []; return i;});

// util function to convert a Mozilla room id into a YVR
// @mozilla email address.  Means less repeated info and perhaps less spam
function atMozYVR(id) {
  return "yvr-" + id + "@mozilla.com";
}

function getFreeBusy() {
  var now = moment();

  console.log("getFreeBusy", now.format('h:mma'));

  rooms.forEach(function (room) {

    var url = format(ics, atMozYVR(room.id), now.format("YYYYMMDD"));

    ical.fromURL(url, {},
      function(err, data) {
        if (err) {
          console.error(err);
          return;
        }

        var today = function (fb) {
          // we only need the items that are within today's free/busy timeframe
          return now.isSame(fb.start, 'day') || now.isSame(fb.end, 'day') ||
                 now.isAfter(fb.start) && now.isBefore(fb.end);
        };

        for (var k in data){
          if (data.hasOwnProperty(k)){
            var ev = data[k];
            if (ev.type && ev.type === "VFREEBUSY" && typeof ev.freebusy !== "undefined") {
              room.freebusy = ev.freebusy.filter(today);
            } else {
              room.freebusy = [];
            }
          }
        }

      }
    );
  });

  // add CALENDAR_INTERVAL min or the remainder of CALENDAR_INTERVAL min
  now.add('minutes', (CALENDAR_INTERVAL - (now.minutes() % CALENDAR_INTERVAL)));
  console.log("next run", now.fromNow());

  // run every CALENDAR_INTERVAL min on the CALENDAR_INTERVAL
  // use the diff against the current time for milliseconds
  setTimeout(getFreeBusy, now.diff());
}

// Both free and busy methods use a 5 min start fuzz such that they will return something
// that is about to be free or about to be busy
function busy(rs) {
  var now = moment();
  return rs.filter(function (room) {
    return room.freebusy && room.freebusy.some(function (fb) {
      var fuzzStart = moment(fb.start).subtract('minutes', BUSY_FUZZ);
      // console.log(room.name, "busy", fuzzStart.fromNow(), "and free again", moment(fb.end).fromNow());
      return fb.type === "BUSY" && now.isAfter(fuzzStart) && now.isBefore(fb.end);
    });
  });
}

function free(rs) {
  var now = moment();
  return rs.filter(function (room) {
    return room.freebusy && room.freebusy.every(function (fb) {
      var fuzzStart = moment(fb.start).subtract('minutes', BUSY_FUZZ);
      var isFree = (fb.type === "FREE" && now.isAfter(fuzzStart) && now.isBefore(fb.end));
      var isNotNow = !(now.isAfter(fb.start) && now.isBefore(fb.end));
      return (isFree || isNotNow);
    });
  });
}

// EXPRESS

var app = express();

app.use(express.static(__dirname + '/public'));

// JSON API

app.get('/api/rooms', function(req, res, next){
  res.send({ fuzz : 0, rooms : rooms });
});

app.get('/api/rooms/free', function(req, res, next){
  res.send({ fuzz : BUSY_FUZZ, rooms : free(rooms) });
});

app.get('/api/rooms/busy', function(req, res, next){
  res.send({ fuzz : BUSY_FUZZ, rooms : busy(rooms) });
});

// HTML WIDGET

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/', function(req, res){
  res.render('index', {
    title: "YVR Conference Rooms"
  });
});

app.get('/js/moment.js', function (req,res) {
  res.sendfile(path.join(__dirname,'node_modules','moment','moment.js'));
});

var server = app.listen(Number(process.env.PORT || 5000), function() {
  getFreeBusy();
  console.log('NODE_ENV=%s http://%s:%d', app.settings.env, server.address().address, server.address().port);
});
