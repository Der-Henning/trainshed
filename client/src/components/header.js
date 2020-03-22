import React, { Component } from "react";
import { Navbar, Button, Nav, Form } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { withRouter } from "react-router-dom";

class Header extends Component {
  logout = e => {
    e.preventDefault();
    this.props.setToken(null);
    this.props.history.push("/login");
  };

  loginForm = () => {
    const { token } = this.props;
    if (token)
      return (
        <Form inline onSubmit={this.logout.bind(this)}>
          <Button variant="outline-success" type="submit">
            Logout
          </Button>
        </Form>
      );
    return (
      <Form inline>
        <NavLink to={"/login"} className="nav-link">
          Login
        </NavLink>
      </Form>
    );
  };

  render() {
    return (
      <Navbar bg="light" expand="md" sticky="top">
        <Navbar.Toggle aria-controls="basic-nav-bar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavLink to={"/"} className="nav-link">
              Home
            </NavLink>
            <NavLink to={"/trainings"} className="nav-link">
              Trainings
            </NavLink>
            <NavLink to={"/admin"} className="nav-link">
              Admin
            </NavLink>
            <NavLink to={"/about"} className="nav-link">
              About
            </NavLink>
          </Nav>
          {this.loginForm()}
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default withRouter(Header);
