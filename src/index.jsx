/* 
import * as React from 'react';
import * as ReactDOM from 'react-dom';

function render() {
  ReactDOM.render(<h2>Hello from React!</h2>, document.body);
}

render(); 
*/
import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);