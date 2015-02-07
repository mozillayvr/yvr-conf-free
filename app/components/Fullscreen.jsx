/** @jsx React.DOM */
var React = require('react');

function isFullScreen () {
  return !!(document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement);
}

function exitFullScreen () {
  (document.exitFullscreen ||
   document.msExitFullscreen ||
   document.mozCancelFullScreen ||
   document.webkitExitFullscreen ||
   function(){}).call(document);
}

function requestFullScreen () {
  var elem = document.body;
  (elem.requestFullscreen ||
   elem.msRequestFullScreen ||
   elem.mozRequestFullScreen ||
   elem.webkitRequestFullScreen ||
   function(){}).call(elem, Element.ALLOW_KEYBOARD_INPUT);
}

var Fullscreen = React.createClass({
  toggleFullScreen : function () {
    if (this.state.isFullScreen) {
      exitFullScreen();
    } else {
      requestFullScreen();
    }
  },
  // As the mouse moves we change our internal state
  // setting a timer that will fire after the mouse wasn't seen moving
  handleMouseMove : function (e) {
    clearTimeout(this.timeout);
    if (!this.state.isMouseMoving) {
      this.setState({ isMouseMoving : true });
    }
    this.timeout = setTimeout(function () {
      this.setState({ isMouseMoving : false });
    }.bind(this), 3 * 1000);
  },
  // handle the global key trigger
  handleKeyDown : function (e) {
    // 70 is "f"
    if (e.keyCode === 70) {
      this.toggleFullScreen();
    }
  },
  // handle the click of the button
  handleClick : function (e) {
    this.toggleFullScreen();
  },
  // watch for the full screen change and update the internal state
  handleFullScreenChange : function (e) {
    this.setState({ isFullScreen : isFullScreen() });
  },
  getInitialState: function() {
    return { isFullScreen : isFullScreen(), isMouseMoving : false };
  },
  componentDidMount: function() {
    document.addEventListener('keydown',
      this.handleKeyDown);
    document.body.addEventListener('mousemove',
      this.handleMouseMove);
    window.addEventListener('mozfullscreenchange',
      this.handleFullScreenChange);
    window.addEventListener('webkitfullscreenchange',
      this.handleFullScreenChange);
  },
  componentWillUnmount: function() {
    document.removeEventListener('keydown',
      this.handleKeyDown);
    document.body.removeEventListener('mousemove',
      this.handleMouseMove);
    window.removeEventListener('mozfullscreenchange',
      this.handleFullScreenChange);
    window.removeEventListener('webkitfullscreenchange',
      this.handleFullScreenChange);
  },
  render: function() {
    var buttonText = this.state.isFullScreen ? 'Leave Fullscreen (f)' : 'Fullscreen (f)';
    var show = this.state.isMouseMoving ? 'show-overlay' : '';
    return (
      <div id="overlay" className={show}>
        <button onClick={this.handleClick} id="fullscreen">{buttonText}</button>
      </div>
    );
  }

});

module.exports = Fullscreen;
