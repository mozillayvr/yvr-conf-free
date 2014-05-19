/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* jshint strict: true, node: true */

"use strict";

// https://www.npmjs.org/package/ical
var ical = require('ical');

var format = require('util').format;

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

// I don't want to pull in moment.js just so I can format a
// date with leading zeros
function leadingZero(number) {
  return ("00" + number).slice(-2);
}

// util function to convert a Mozilla room id into a YVR
// @mozilla email address.  Means less repeated info and perhaps less spam
function atMozYVR(id) {
  return "yvr-" + id + "@mozilla.com";
}

var d = new Date();
// need the date in 20140516 format
var date = format("%d%s%s", d.getFullYear(), leadingZero(d.getMonth()), leadingZero(d.getDate()));

console.log("DATE", date);

rooms.forEach(function (room) {
  console.log("ROOM", room);
  var url = format(ics, atMozYVR(room.id), date);
  console.log("URL", url);
  ical.fromURL(url, {},
    function(err, data) {
      if (err) {
        console.error(err);
        return;
      }

      for (var k in data){
        if (data.hasOwnProperty(k)){
          var ev = data[k];
          for (var e in ev) {
            if (ev.hasOwnProperty(e)){
              console.log("E", e, ev);
            }
          }
        }
      }

    }
  );
});
