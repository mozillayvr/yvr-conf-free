/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* jshint strict: true, node: true */

"use strict";

// https://www.npmjs.org/package/ical
// FreeBusy data requires https://github.com/clarkbw/ical.js
var ical = require('ical');

var util = require('util');

// ICS calendar URL format, first %s requires email, second %s requires date in 20140516 format
// thanks to this: http://www.zimbra.com/forums/users/16877-only-publish-free-busy-information-icalendar.html#post88423
var ics = "https://mail.mozilla.com/home/%s/Calendar?fmt=ifb&date=%s";

// email addresses for all the Mozilla YVR conference rooms
var emails = ["yvr-2a@mozilla.com", "yvr-2b@mozilla.com", "yvr-2c@mozilla.com", 
              "yvr-2d@mozilla.com", "yvr-2e@mozilla.com", "yvr-2f@mozilla.com",
              "yvr-2g@mozilla.com", "yvr-2h@mozilla.com", "yvr-commons@mozilla.com"];

// I don't want to pull in moment.js just so I can format a
// date with leading zeros
function leadingZero(number) {
  return ("00" + number).slice(-2);
}


var d = new Date();
// need the date in 20140516 format
var date = util.format("%d%s%s", d.getFullYear(), leadingZero(d.getMonth()), leadingZero(d.getDate()));

console.log("DATE", date);

emails.forEach(function (email) {
  console.log("EMAIL", email);
  var url = util.format(ics, email, date);
  console.log("URL", url);
  ical.fromURL(url, {}, 
    function(err, data) {
      console.log("ERROR", err);
      console.log("DATA", data);

      for (var k in data){
        if (data.hasOwnProperty(k)){
          var ev = data[k]
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
