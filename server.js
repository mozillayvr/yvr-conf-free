/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* jshint strict: true, node: true */

"use strict";

var ical = require('ical');

var format = require('util').format;
var path = require('path');

var express = require('express');

var moment = require('moment');

var config = require('config');

var CALENDAR_INTERVAL = config.get('ics.calender-interval');; // in minutes

var BUSY_FUZZ = config.get('ics.busy-fuzz');

moment.lang('en', config.get('moment.en'));

var ics = config.get('ics.url');

var rooms = config.get('ics.rooms').map(
  function transform(i) {
    i.freebusy = [];
    i.email = "yvr-" + i.id + "@mozilla.com";
    return i;
  }
);

function todayFilter(m, fb) {
  // we only need the items that are within today's free/busy timeframe
  return m.isSame(fb.start, 'day') || m.isSame(fb.end, 'day') ||
         m.isAfter(fb.start) && m.isBefore(fb.end);
}

function getFreeBusy() {
  var now = moment();

  console.log("getFreeBusy", now.format('h:mma'));

  rooms.forEach(function (room) {
    // ICS calendar URL format: 
    //  first %s requires email, 
    //  second %s requires date in YYYMMMDDD (20140516) format
    var url = format(ics, room.email, now.format("YYYYMMDD"));

    ical.fromURL(url, {},
      function(err, data) {
        if (err) { throw err; }

        var today = todayFilter.bind(undefined, now);

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
    title: config.get('ics.title')
  });
});

app.get('/js/moment.js', function (req,res) {
  res.sendfile(path.join(__dirname,'node_modules','moment','moment.js'));
});

var server = app.listen(Number(process.env.PORT || 5000), function() {
  getFreeBusy();
  console.log('NODE_ENV=%s http://%s:%d', app.settings.env, server.address().address, server.address().port);
});
