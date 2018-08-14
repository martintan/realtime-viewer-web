import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

class App extends Component {

  render() {
    return (
      <form>
        <FormGroup>
          <ControlLabel>Date:</ControlLabel>
          <FormControl
            type="text"
            placeholder="mm/dd/yy" />
        </FormGroup>
      </form>
    );
  }
}

export default App;
