import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import QueryString from 'query-string';

class Comments extends Component {

  state = { 
    comment: '',
    comments: []
  };

  componentDidMount() {
    this.fetchAllComments();
  }

  fetchAllComments = () => {
    const id = QueryString.parse(this.props.location.search).id;
    if (!id) return;
    fetch(`/api/docs/${id}`)
    .then(res => res.json())
    .then(results => {
      if (results.length > 0) {
        const doc = results[0];
        this.setState({ comments: doc.comments });
      }
    })
    .catch(err => console.log(err));
  }

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  onSubmit = e => {
    e.preventDefault();
    if (this.state.comment) {
      const id = QueryString.parse(this.props.location.search).id;
      const data = { comment: this.state.comment };
      fetch(`/api/docs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
      })
      .then(res => res.json())
      .then(comment => {
        console.log(comment);
        this.fetchAllComments();
      })
      .catch(err => console.log(err));
    }
  }

  render() {
    return (
      <div>
        <h3>Comments</h3>
        <ListGroup>
          {this.state.comments.map(c => <ListGroupItem>{c}</ListGroupItem>)}
        </ListGroup>
        <FormGroup>
          <FormControl 
            type="text" 
            name="comment" 
            placeholder="Add comment.." 
            style={{ marginBottom: '10px' }}
            value={this.state.comment}
            onChange={this.onChange} />
          <Button bsStyle="primary" onClick={this.onSubmit} block>Submit</Button>
        </FormGroup>
      </div>
    );
  }
}

export default withRouter(Comments);