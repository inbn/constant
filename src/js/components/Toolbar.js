import React from 'react';

const Toolbar = React.createClass({
  render() {
    return (
      <div className="control-bar">
        <div className="l-container l-container--full-width">
          <button id="js-new-timer" className="button">New Timer</button>
          <div id="js-master-clock-container" className="clock clock--master"></div>
        </div>
      </div>
    )
  }
})

export default Toolbar;
