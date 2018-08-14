import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import NavigationBar from './components/NavigationBar';
import Main from './components/Main';
import logo from './logo.svg';

const colDebugStyle = { border: 'solid 1px red' };

export default class App extends Component {

  render() {
    return (
      <div>
        <NavigationBar />
        <Main />
      </div>
    );
  }
}
