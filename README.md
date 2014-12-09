# yvr-conf-free

A conference room dashboard designed to run on TV displays that lets Mozilla YVR employees know which rooms are currently busy and which rooms are free.  Uses Node.js with ical to gather the Mozilla YVR conference room FreeBusy information

## Running

* https://yvr-conf.paas.allizom.org/

## Getting Started

    npm install
    npm start

## Endpoints and API

* Main Interface
  * http://0.0.0.0:5000/
* All Rooms and related Free / Busy information
  * http://0.0.0.0:5000/api/rooms
* Only rooms currently busy
  * http://0.0.0.0:5000/api/rooms/busy
* Only rooms currently free
  * http://0.0.0.0:5000/api/rooms/free

( NOTE: API endpoints for busy and free times includes a default 5 min start time 'fuzz' where a room will be included if it is about to become free or busy )

## Screenshot

http://cl.ly/image/0C0k0x0Q2I2g

## Mozilla YVR Supported Conference Rooms

* Siwash : yvr-2a
* Buntzen : yvr-2b
* Deep Cove : yvr-2c
* Lighthouse : yvr-2d
* Crazy Raven : yvr-2e
* Wreck : yvr-2f
* Dinky Peak : yvr-2g
* Adanac : yvr-2h
* Whytecliff : yvr-commons

Mozilla Zimbra ICS Calendar URL Format:

    https://mail.mozilla.com/home/$EMAIL/Calendar?fmt=ifb&date=$DATE

Where `$EMAIL` = conf room email AND `$DATE` = moment.format("YYYYMMDD")


## Deployment at Mozilla YVR

*This will only apply for folks that have Mozilla LDAP accounts*

To deploy to the Mozilla PaaS, you will first need to be a member of the YVR group. If you're not, feel free to ping @cturra for access.
With access and the [stackato client](https://api.paas.allizom.org/console/client/), run the following commands to login and join the group:

```
  stackato target api.paas.allizom.org
  stackato login <email>
  stackato group yvr
```

Now you can push with the npm script

    npm run push

