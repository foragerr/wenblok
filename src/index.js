import React from 'react';
import ReactDOM from 'react-dom';
import 'index.css';
import Main from 'components/Main/Main';
import ReactGA from "react-ga4";

ReactGA.initialize('G-XNZVD45GX8');
ReactGA.send("pageview");

ReactDOM.render(
  <div id="index">
    <Main />
  </div>,
  document.getElementById('root'),
);
