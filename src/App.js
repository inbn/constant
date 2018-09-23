import React, { Component } from 'react';

import Header from './components/Header';
import Timer from './components/Timer';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timers: []
    };

    this.createTimer({ isMaster: true });
  }

  createTimer = (timer = {}) => {
    let newTimer = Object.assign(
      {
        title: 'New timer',
        isMaster: false,
        isActive: false
      },
      timer
    );

    this.setState({
      timers: [...this.state.timers, newTimer]
    });
  };

  render() {
    return (
      <div className="App">
        <header>
          <Header />
          <div className="control-bar">
            <div className="l-container l-container--full-width">
              <button id="js-new-timer" className="button" onClick={this.createTimer}>
                New Timer
              </button>
              <div id="js-master-clock-container" className="clock clock--master" />
            </div>
          </div>
        </header>
        <main className="l-container l-container--full-width">
          <div id="js-timers-container" className="l-flex-container">
            {this.state.timers.map((timer, index) => {
              return !timer.isMaster ? <Timer {...timer} key={index} /> : null;
            })}
          </div>
        </main>
      </div>
    );
  }
}

export default App;
