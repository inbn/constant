import React from 'react';

import Toolbar from './Toolbar';

const Header = React.createClass({
  render() {
    return (
      <header>
        <div className="hero-header">
          <h1 className="hero-header__title">constant</h1>
          <h2 className="hero-header__sub-title">Time tracking for procrastinators</h2>
        </div>
        <Toolbar />
      </header>
    )
  }
})

export default Header;
