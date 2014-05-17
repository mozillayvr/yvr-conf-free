yvr-conf-free
=============

A node.js server that gathers the Mozilla YVR conference room FreeBusy information in an effort to display the conference rooms that are currently available for use.

Current Status
=============

TODO
- [ ] Collect relevant iCal information locally
- [ ] Update the Date daily to change the query URL
- [ ] Serve HTML

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

ICS Calendar Format:
https://mail.mozilla.com/home/$EMAIL/Calendar?fmt=ifb&date=$DATE
Where $EMAIL = above room emails AND $DATE = format(20140516)
