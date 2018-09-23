import React, { Component } from 'react';

class Timer extends Component {
  updateTimerTitle(event) {
    let value = event.target.value;
  }

  render() {
    return (
      <div className="l-flex-item">
        <div className="clock">
          <input
            type="text"
            className="clock__title-input"
            placeholder="New timer"
            value={this.props.title}
            onChange={this.updateTimerTitle}
          />
          <p className="clock__timer">0:00:00</p>
          <button className={'clock__button button' + (this.props.isActive ? ' is-active' : '')}>
            {this.props.isActive ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
    );
  }
}

export default Timer;
