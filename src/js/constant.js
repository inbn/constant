import React from 'react';

import { render } from 'react-dom';

import { Router, Route, IndexRoute, browserHistory } from 'react-router';

// Import Components
import App from './components/App';

const router = (
  <Router history={browserHistory}>
    <Route path="/" component={App} />
  </Router>
)

render(router, document.getElementById('root'));
