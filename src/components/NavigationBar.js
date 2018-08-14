import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Navbar, Nav, NavItem, MenuItem } from 'react-bootstrap';

class Sidebar extends Component {

  render() {
    return (
      <Navbar fluid>

        <Navbar.Header>
          <Navbar.Brand>
            <a href="/">Editor</a>
          </Navbar.Brand>
        </Navbar.Header>

        <Nav pullRight>
          <NavItem componentClass={Link} href='/docs' to='/docs' active={this.props.location.pathname === '/docs'}>
            Docs
          </NavItem>
          <NavItem eventKey={1}>
            Account
          </NavItem>
          <NavItem eventKey={2}>
            Logout
          </NavItem>  
        </Nav>

      </Navbar>
    );
  }
}

export default withRouter(Sidebar);
