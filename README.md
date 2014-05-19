yvr-conf-free
=============

A node.js server that gathers the Mozilla YVR conference room FreeBusy information in an effort to display the conference rooms that are currently available for use.

Getting Started
=============

  npm install
  npm start


Current Status
=============

TODO
- [ ] Make a nice looking HTML widget

- [x] Collect relevant iCal information locally
- [x] Update the Date daily to change the query URL
- [x] Serve HTML
- [x] Our iCal library now handles FreeBusy information
- [x] This Node.js file grabs all the FB data for Mozilla YVR

Conference Rooms
=============
(all at mozilla.com)
* Siwash : yvr-2a
* Buntzen : yvr-2b
* Deep Cove : yvr-2c
* Lighthouse : yvr-2d
* Crazy Raven : yvr-2e
* Wreck : yvr-2f
* Dinky Peak : yvr-2g
* Adanac : yvr-2h
* Whytecliff : yvr-commons

Zimbra ICS Calendar URL Format:
  https://mail.mozilla.com/home/$EMAIL/Calendar?fmt=ifb&date=$DATE
Where `$EMAIL` = conf room email AND `$DATE` = moment.format("YYYYMMDD")
