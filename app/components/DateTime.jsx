var React = require('react');
var moment = require('moment');

var DateTime = React.createClass({
  getInitialState: function() {
    return { time : moment() };
  },
  tick: function() {
    this.setState({ time : moment() });
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
  render: function() {
    return (
      <div id="dateTime">
        <h2 className="pull-left" id="time">{this.state.time.format('h:mm a')}</h2>
        <h2 className="pull-right" id="date">{this.state.time.format('dddd, MMMM Do')}</h2>
        <div className="clearfix"/>
      </div>
    );
  }

});

module.exports = DateTime;
