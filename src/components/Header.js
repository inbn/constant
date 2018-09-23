import React, { Component } from 'react';

class Header extends Component {
  render() {
    return (
      <div className="hero-header">
        <h1 className="hero-header__title">constant</h1>
        <p className="hero-header__sub-title">Time tracking for procrastinators</p>
      </div>
    );
  }
}

export default Header;
