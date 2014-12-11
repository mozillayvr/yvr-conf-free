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

var _ = require('underscore');

_.mixin({
  fuzz : function fuzz (time) {
    return moment(time).subtract('minutes', BUSY_FUZZ);
  },
  isFree : function isFree (ev) {
    return (ev.type === "FREE");
  },
  isBusy : function isBusy (ev) {
    return (ev.type === "BUSY");
  }
});

var config = require('config');

var CALENDAR_INTERVAL = config.get('ics.calender-interval');; // in minutes

var BUSY_FUZZ = config.get('ics.busy-fuzz');

moment.lang('en', config.get('moment.en'));

var ics = config.get('ics.url');

var rooms = config.get('ics.rooms').map(
  function transform(i) {
    i.email = "yvr-" + i.id + "@mozilla.com";
    return i;
  }
);

function getFreeBusy() {
  var now = moment();
  var todayFilter = function(fb) {
    // we only need the items that are within today's free/busy timeframe
    return now.isSame(fb.start, 'day') ||
           now.isSame(fb.end, 'day') ||
           now.isAfter(fb.start) && now.isBefore(fb.end);
  };

  console.log("getFreeBusy", now.format('h:mma'));

  _.each(rooms, function (room) {
    // ICS calendar URL format: 
    //  first %s requires email, 
    //  second %s requires date in YYYMMMDDD (20140516) format
    var url = format(ics, room.email, now.format("YYYYMMDD"));

    ical.fromURL(url, {},
      function(err, data) {
        if (err) { console.error(err); return err; }
        // strip down the information to lists of Free Busy arrays
        data = _.pluck(_.where(data, {type : 'VFREEBUSY'}), 'freebusy');
        // Merge the arrays and convert the undefined items into empty arrays
        //  Filter to only the data relevant to today
        room.freebusy = _.filter(_.flatten(_.compact(data)), todayFilter);
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
  return _.filter(rs, function (room) {
    return _.some(room.freebusy, function (fb) {
      // console.log(room.name, "busy", fuzzStart.fromNow(), "and free again", moment(fb.end).fromNow());
      return _.isBusy(fb) && now.isAfter(_.fuzz(fb.start)) && now.isBefore(fb.end);
    });
  });
}

function free(rs) {
  var now = moment();
  return _.filter(rs, function (room) {
    return _.some(room.freebusy, function (fb) {
      var isFree = (_.isFree(fb) && now.isAfter(_.fuzz(fb.start)) && now.isBefore(fb.end));
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
