/** @jsx React.DOM */
var React = require('react');
var _ = require('lodash');

var capacity = ["small", "medium", "large"];

var Peeps = React.createClass({
  render : function () {
    var peeps = _.times(this.props.size, function (i) {
      return <span key={i} className='glyphicon glyphicon-user pull-right' aria-hidden="true"></span>;
    });
    return (
      <div className="size">
        {peeps}
        <span className="sr-only">{capacity[this.props.size]}</span>
      </div>
    );
  }
});

module.exports = Peeps;
