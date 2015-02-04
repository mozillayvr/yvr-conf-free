/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* jshint strict: true, node: true */

'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify'); 
var literalify = require('literalify');
var del = require('del');

var config = require('./package.json');

function handleError (err) {
  $.util.log(err);
  this.emit('end'); // so that gulp knows the task is done
}

var vendorjs = [
  'node_modules/react/react-with-addons.js',
  'node_modules/lodash/dist/lodash.js',
  'node_modules/moment/moment.js',
  'node_modules/moment/lang/nb.js',
  'bower_components/jquery/dist/jquery.js',
  'bower_components/bootstrap/dist/js/bootstrap.js'
]

// Load plugins
var $ = require('gulp-load-plugins')();

gulp.task('clean', function(next) {
  del([config.dest.dist + '/**'], next);
})

// HTML
gulp.task('html', function() {
  return gulp.src('app/index.html')
    .pipe(gulp.dest(config.dest.dist))
})

// Styles
gulp.task('styles', function () {
  return gulp.src(config.paths.less)
             .pipe($.less())
             .on('error', handleError)
             .pipe($.autoprefixer('last 1 version'))
             .on('error', handleError)
             .pipe($.concat(config.dest.style))
             .pipe(gulp.dest(config.dest.dist))
             .pipe($.size());
});

gulp.task('fonts', function() {
  gulp.src(['styles/fonts/*',
            'bower_components/fontawesome/fonts/*',
            'bower_components/bootstrap/dist/fonts/*'])
    .pipe(gulp.dest(config.dest.fonts))
})

// Scripts
gulp.task('vendorjs', function() {
  gulp.src(vendorjs)
    .pipe($.concat(config.dest.vendorjs))
    .pipe(gulp.dest(config.dest.dist))
})

gulp.task('lint', function() {
  return gulp.src(config.paths.js)
             .pipe($.jshint())
             .pipe($.jshint.reporter('default'));
});

gulp.task('scripts', ['lint'], function() {
  return browserify(config.paths.app)
          .transform(reactify)
          .bundle()
          .on('error', handleError)
          .pipe(source(config.dest.app))
          .pipe($.license('MPL', {tiny: false}))
          .pipe(gulp.dest(config.dest.dist));

  // bundler.require('react');
  // bundler.require('moment');
  // bundler.require('./app/main.js');

  // If we're running a gulp.watch and browserify finds and error, it will
  // throw an exception and terminate gulp unless we catch the error event.
  // return bundler
  //       .bundle()
  //       .on('error', function (err) {
  //         $.util.log(err);
  //         this.emit('end'); // so that gulp knows the task is done
  //       })
  //       .pipe(source('main.js'))
  //       .pipe(gulp.dest(config.build.dir));
});

// gulp.task('scripts', ['browserify'], function() {
//   return gulp.src(config.build.alljs)
//     .pipe($.license('MPL', {tiny: false}))
//     .pipe(gulp.dest(package.dest.dist))
//     .pipe($.size())
//     .pipe($.livereload());
// });

gulp.task('watch', ['html', 'vendorjs', 'scripts', 'styles', 'fonts'], function() {
  var nodestatic = require('node-static');
  var fileserver = new nodestatic.Server(config.dest.dist);
  require('http').createServer(function(request, response) {
    request.addListener('end', function() {
      fileserver.serve(request,response);
    }).resume();
  }).listen(8181);

  console.log('http://localhost:8181/');

  $.livereload.listen();

  gulp.watch('./styles/*.less', ['styles']);
  gulp.watch([config.paths.app, config.paths.jsx], ['scripts']);
  gulp.watch(vendorjs, ['vendorjs'])
  gulp.watch('app/index.html', ['html']);
});

// Starts our development workflow
gulp.task('default', ['html', 'vendorjs', 'scripts', 'styles', 'fonts']);

gulp.task('deploy', function () {

});

gulp.task('test', function () {
    return gulp.src('./build/testrunner-phantomjs.html').pipe($.jasmine2Phantomjs());
});
