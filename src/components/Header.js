import React, { Component } from 'react';

import Toolbar from './Toolbar';

class Header extends Component {
  render() {
    return (
      <header>
        <div className="hero-header">
          <h1 className="hero-header__title">constant</h1>
          <p className="hero-header__sub-title">Time tracking for procrastinators</p>
        </div>
        <Toolbar />
      </header>
    );
  }
}

export default Header;
