# yvr-conf-free

A conference room dashboard designed to run on TV displays that lets Mozilla YVR employees know which rooms are currently busy and which rooms are free.  Uses Node.js with ical to gather the Mozilla YVR conference room FreeBusy information

## Running

* https://yvr-conf.herokuapp.com/

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

Where `$EMAIL` = conf room email AND `$DATE` = moment.format("YYYYMMDD")


## Deployment to Heroku

If you want to deploy to the heroku account contact @clarkbw

You can push with the npm script:

    npm run push
