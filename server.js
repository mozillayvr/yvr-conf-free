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

// ICS calendar URL format, first %s requires email, second %s requires date in 20140516 format
// thanks to this: http://www.zimbra.com/forums/users/16877-only-publish-free-busy-information-icalendar.html#post88423
var ics = "https://mail.mozilla.com/home/%s/Calendar?fmt=ifb&date=%s";

// room names and ids for all the Mozilla YVR conference rooms
var rooms = [ { name : "Siwash", id : "2a" },
              { name : "Buntzen", id : "2b" },
              { name : "Deep Cove", id : "2c" },
              { name : "Lighthouse", id : "2d" },
              { name : "Crazy Raven", id : "2e" },
              { name : "Wreck", id : "2f" },
              { name : "Dinky Peak", id : "2g" },
              { name : "Adanac", id : "2h" },
              // not sure I should be including this one
              { name : "Whytecliff", id : "commons" }
            ];

// util function to convert a Mozilla room id into a YVR
// @mozilla email address.  Means less repeated info and perhaps less spam
function atMozYVR(id) {
  return "yvr-" + id + "@mozilla.com";
}

function humanize(e) {
  e.starts = moment(e.start).fromNow();
  e.ends   = moment(e.end).fromNow();
  return e;
}

function getFreeBusy() {
  var now = moment();

  console.log("getFreeBusy", now.toISOString());

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
              room.freebusy = ev.freebusy.filter(today).map(humanize);
            } else {
              room.freebusy = [];
            }
          }
        }

      }
    );
  });


  // add 15 min or the remainder of 15 min
  now.add('minutes', (15 - (now.minutes() % 15)));
  console.log("next run", now.fromNow());

  // run every 15 min on the 15
  // use the diff against the current time for milliseconds
  setTimeout(getFreeBusy, now.diff());
}

// Both free and busy methods use a 5 min start fuzz such that they will return something
// that is about to be free or about to be busy
function busy(rs) {
  var now = moment();
  return rs.filter(function (room) {
    return room.freebusy && room.freebusy.some(function (fb) {
      var fuzzStart = moment(fb.start).subtract('minutes', 5);
      console.log(room.name, "busy", fuzzStart.fromNow(), "and free again", moment(fb.end).fromNow());
      return fb.type === "BUSY" && now.isAfter(fuzzStart) && now.isBefore(fb.end);
    });
  });
}

function free(rs) {
  var now = moment();
  return rs.filter(function (room) {
    return room.freebusy && room.freebusy.every(function (fb) {
      var fuzzStart = moment(fb.start).subtract('minutes', 5);
      var isFree = (fb.type === "FREE" && now.isAfter(fuzzStart) && now.isBefore(fb.end));
      var isNotNow = !(now.isAfter(fuzzStart) && now.isBefore(fb.end));
      return (isFree || isNotNow);
    });
  });
}

// EXPRESS

var app = express();

app.configure('development, test', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

app.use(express.logger());

// JSON API

app.get('/api/rooms', function(req, res, next){
  res.send(rooms);
});

app.get('/api/rooms/free', function(req, res, next){
  res.send(free(rooms));
});

app.get('/api/rooms/busy', function(req, res, next){
  res.send(busy(rooms));
});

// HTML WIDGET

// expose moment to ejs
app.locals.moment = function(date) {
  return moment(date);
}

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/js/moment.js', function (req,res) {
  res.sendfile(path.join(__dirname,'node_modules','moment','moment.js'));
});

app.get('/', function(req, res){
  res.render('index', {
    rooms: rooms,
    title: "Mozilla YVR Conference Rooms"
  });
});

var server = app.listen(3002, function() {
  getFreeBusy();
  console.log('Listening on port %d', server.address().port);
});
