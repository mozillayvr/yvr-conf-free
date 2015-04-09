/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* jshint strict: true, node: true */

'use strict';

var config = require('config');
var path = require('path');

var app = require('gcal-conf-free-api').app;

app.use('/', require('express').static(path.join(__dirname, 'public')));

var server = app.listen(Number(process.env.PORT || config.get('ics.port')), function() {
  console.log('NODE_ENV=%s http://%s:%d', app.settings.env, server.address().address, server.address().port);
});
