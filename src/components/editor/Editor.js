import React, { Component } from 'react';
import SlateEditor from './SlateEditor';
import Sidebar from './Sidebar';
import { Grid, Row, Col } from 'react-bootstrap';
import checkAuth from '../checkAuth';
import io from 'socket.io-client';

var socket = null;

const subscribeToChanges = cb => {
  socket.on('receivedChange', changes => cb(null, changes));
};

const pushChanges = changes => {
  socket.emit('giveChange', changes);
};

export default class Editor extends Component {

  state = {
    clients: [],
    value: null,
    text: null,
  }

  constructor(props) {
    super(props);
    console.log(checkAuth());
    socket = io('http://192.168.0.109:8000');
    socket.on('connectionChanges', clients => {
      console.log('connectionChanges: ', clients);
      this.setState({ clients });
    });
  }

  onContentChange = value => this.setState({ value });

  onImportDoc = text => this.setState({ text });

  render() {
    return (
      <div className="App" id="slateEditor">
        <Grid fluid={true}>
          <Row>
            <Col xs={2} style={{}}>
              <Sidebar 
                clients={this.state.clients}
                value={this.state.value}
                onImportDoc={this.onImportDoc} />
            </Col>
            <Col xs={10} style={{}}>
              <SlateEditor 
                subscribeToChanges={subscribeToChanges} 
                pushChanges={pushChanges}
                onContentChange={this.onContentChange}
                importedText={this.state.text} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
