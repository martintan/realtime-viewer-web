import React, { Component } from 'react';
import SlateEditor from './components/SlateEditor';
import { Grid, Row, Col } from 'react-bootstrap';
import logo from './logo.svg';

class App extends Component {

  render() {
    return (
      <div className="App">
        <Grid fluid={true}>
          <Row>

          </Row>
          <Row>
            <Col xs={3}>

            </Col>
            <Col xs={9}>
              <SlateEditor />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default App;
