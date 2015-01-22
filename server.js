/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* jshint strict: true, node: true */

"use strict";

var path = require('path');

var config = require('config');

var app = require('gcal-conf-free-api');

app.use(require('express').static(__dirname + '/public'));

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
  console.log('NODE_ENV=%s http://%s:%d', app.settings.env, server.address().address, server.address().port);
});
