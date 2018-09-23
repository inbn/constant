import React, { Component } from 'react';

import Header from './components/Header';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <main className="l-container l-container--full-width">
          <div id="js-timers-container" className="l-flex-container" />
        </main>
      </div>
    );
  }
}

export default App;
