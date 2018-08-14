import React, { Component } from 'react';
import { Grid, ListGroup, ListGroupItem } from 'react-bootstrap';

export default class Docs extends Component {

  state = {
    docs: [],
  }

  componentDidMount() {
    this.getAllDocs();
  }

  getAllDocs = () => {
    fetch('/api/docs')
      .then(res => {
        console.log(res);
        if (res.ok) return res.json();
        throw new Error(res.statusText);
      })
      .then(docs => {
        console.log(docs);
        this.setState({ docs });
      })
      .catch(err => console.log(err));
  }

  render() {
    const docs = this.state.docs.map(doc => <ListGroupItem href={`/?id=${doc._id}`}>{doc.name}</ListGroupItem>);
    return (
      <Grid fluid>
        <h2>Saved documents</h2>
        <ListGroup>{docs}</ListGroup>
      </Grid>
    );
  }
}
