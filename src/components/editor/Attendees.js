import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

export default class Attendees extends Component {

  render() {
    const attendees = this.props.attendees;
    return (
      <div>
        <h3>Attendees</h3>
        <ListGroup>
          {attendees ? attendees.map((name, i) => {
            return (
              <ListGroupItem key={i}>{name}</ListGroupItem>
            );
          }) : 'No one.'}
        </ListGroup>
      </div>
    );
  }
}
