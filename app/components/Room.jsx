/** @jsx React.DOM */
var React = require('react');
var ReactAddons = require('react/addons').addons;
var _ = require('lodash');
var moment = require('moment');
// TODO: use the config version of this
moment.lang('en', {
    relativeTime : {
        future: "at %s",
        past:   "%s ago",
        s:  "a jiff",
        m:  "%d min",
        mm: "%d mins",
        h:  "%d hour",
        hh: "%d hours",
        d:  "a day",
        dd: "%d days",
        M:  "a month",
        MM: "%d months",
        y:  "a year",
        yy: "%d years"
    }
});

var Peeps = require('./Peeps.jsx');
var BUSY_FUZZ = 10;

var Room = React.createClass({
  getInitialState: function() {
    return { time : moment(),
             busy : null, // free / busy object == props.room.current
             next : null, // free / busy object == props.room.next
             soon : false // is either free or busy soon
            };
  },
  tick: function() {
    var state = { time : moment() };
    var start,
        end,
        now = moment(),
        fuzzFromNow = now.clone().add(BUSY_FUZZ, 'minutes');

    state.soon = false;
    if (this.state.busy) {
      end = moment(this.state.busy.end);
      state.soon = end.isBetween(now, fuzzFromNow);
    } else if (this.state.next) { // if free and upcoming event
      start = moment(this.state.next.start);
      state.soon = start.isBetween(now, fuzzFromNow);
    }

    this.setState(state);
  },
  componentWillReceiveProps: function(nextProps) {
    var state = { busy : nextProps.room.current,
                  next : nextProps.room.next };
    this.setState(state);
  },
  componentWillMount: function() {
  },
  componentDidMount: function() {
    // quick setTimeout to get the clock in sync
    setTimeout(function () {
      this.interval = setInterval(this.tick, 1000 * 60);
    }.bind(this), (60 - moment().seconds()) * 10);
  },
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  render : function () {
    var room = this.props.room;
    if (!room) {
      return <div/>;
    }

    console.log(room.name, this.state);
    var text = "", when = "";
    if (this.state.busy) {
      text = "free";
      text += (this.state.soon) ? " in " : " at ";
      when = (this.state.soon) ? moment(this.state.busy.end).fromNow() : moment(this.state.busy.end).format('h:mma');
    } else if (this.state.next) {
      text = "booked";
      text += (this.state.soon) ? " in " : " at ";
      when = (this.state.soon) ? moment(this.state.next.end).fromNow() : moment(this.state.next.end).format('h:mma');
    }

    var cxs = {
      'room' : true,
      'room-vidyo' : room.vidyo,
      'room-free' : (this.state.busy === null),
      'room-busy' : (this.state.busy !== null),
      'room-free-soon' : (this.state.next === null && this.state.soon),
      'room-busy-soon' : (this.state.next !== null && this.state.soon)
    };
    cxs['room-size-' + room.size] = true;

    var roomClasses = ReactAddons.classSet(cxs);

    // Terrible hack :(
    // The random 20 value is equal to the px of margin between the small boxes
    var height = (this.props.room.size > 2) ? ($(window).height() + 20) : ($(window).height());
    // Here we just grab the padding we are aware of and adjust for it
    var padding = $("body").innerHeight() - $("body").height();
    height -= (padding * 2) + $("#dateTime").height() * 2.2;
    // For the large room we wanted to make it take the whole height
    // All other rooms want only half the height
    height = (this.props.room.size > 2) ? height : height / 2;

    var divStyle = {
      height : height
    };

    return (

      <article style={divStyle} className={roomClasses}>
        <h2 className="name">{this.props.room.name}</h2>
        <span className="glyphicon glyphicon-ok" aria-hidden="true"></span>
        <div className="fb">
          <span className="fb-text">{text}</span>
          <span className="fb-when">{when}</span>
          <div className="attrs">
            <Peeps size={this.props.room.size} />
            <div className="vidyo">
                <span className={(this.props.room.vidyo) ? 'pull-left glyphicon glyphicon-facetime-video' : ''} aria-hidden="true"></span>
                <span className="sr-only">{(this.props.room.vidyo) ? 'Vidyo Support' : ''}</span>
            </div>
          </div>
        </div>
      </article>
    );
  }
});

module.exports = Room;
