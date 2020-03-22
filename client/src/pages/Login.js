import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  error = () => {
    const { error } = this.state;
    if (error)
      return (
        <Form.Text className={styles.error}>{error.status.message}</Form.Text>
      );
    return null;
  };

  login = e => {
    e.preventDefault();
    const { api } = this.props;
    const username = e.target.username.value;
    const password = e.target.password.value;
    this.setState({ error: null });
    Axios.post(
      api + "/user/authenticate",
      qs.stringify({
        username: username,
        password: password
      })
    )
      .then(res => {
        if (res.headers["x-auth-token"]) {
          this.props.setToken(res.headers["x-auth-token"]);
          this.props.history.push("/");
        }
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data });
      });
  };

  render() {
    return (
      <Form onSubmit={this.login.bind(this)} className={styles.wrapper}>
        <Form.Group>
          <Form.Label>Benutzername</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="username"
            className="mr-sm-2"
            autoFocus
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Passwort</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="password"
            className="mr-sm-2"
          />
        </Form.Group>
        <Form.Group>{this.error()}</Form.Group>
        <Button variant="outline-success" type="submit">
          Login
        </Button>
      </Form>
    );
  }
}

export default withRouter(Login);
