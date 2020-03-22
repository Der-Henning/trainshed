import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: {
        username: "",
        password: "",
        mail: "",
        level: 0,
        unit: ""
      },
      userId: this.props.match.params.id,
      unitList: []
    };
  }

  fetchUser = () => {
    const { api, token } = this.props;
    const { userId } = this.state;
    this.setState({ error: null });
    Axios.get(api + "/user/" + userId, {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({
          data: res.data.data,
          error: res.data.status
        });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  fetchUnitList = () => {
    const { api, token } = this.props;
    Axios.get(api + "/unit", {
      headers: { "x-access-token": token }
    }).then(res => {
      this.setState({
        unitList: res.data.data
      });
    });
  };

  addUser = () => {
    const { api, token } = this.props;
    const { data } = this.state;
    this.setState({ error: null });
    Axios.post(api + "/user", qs.stringify(data), {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({
          data: res.data.data,
          userId: res.data.data.id,
          error: res.data.status
        });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  updateUser = () => {
    const { api, token } = this.props;
    const { data, userId } = this.state;
    this.setState({ error: null });
    Axios.put(
      api + "/user/" + userId,
      qs.stringify({
        data
      }),
      {
        headers: { "x-access-token": token }
      }
    )
      .then(res => {
        this.setState({
          data: res.data.data,
          error: res.data.status
        });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  deleteUser = () => {
    const { api, token } = this.props;
    const { userId } = this.state;
    Axios.delete(api + "/user/" + userId, {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.props.history.push("/admin/users");
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  submitHandler = e => {
    e.preventDefault();
    if (this.state.userId) this.updateUser();
    else this.addUser();
  };

  error = () => {
    const { error } = this.state;
    if (error)
      return <Form.Text className={styles.error}>{error.message}</Form.Text>;
    return null;
  };

  changeHandler = e => {
    const { name, value } = e.target;
    var { data } = this.state;
    data[name] = value;
    this.setState({ data });
  };

  componentDidMount() {
    const { userId } = this.state;
    this.fetchUnitList();
    if (userId) this.fetchUser();
  }

  render() {
    const { data, userId, unitList } = this.state;
    return (
      <div>
        <h3>{userId ? "Nutzer bearbeiten" : "neuen Nutzer anlegen"}</h3>
        <Form onSubmit={this.submitHandler} className={styles.wrapper}>
          <Form.Group>
            <Form.Label>Username</Form.Label>
            <Form.Control
              name="username"
              type="text"
              value={data.username ? data.username : ""}
              autoFocus
              required
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Mail</Form.Label>
            <Form.Control
              name="mail"
              type="text"
              value={data.mail ? data.mail : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Nutzerlevel</Form.Label>
            <Form.Control
              type="text"
              name="level"
              value={data.level ? data.level : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Einheit</Form.Label>
            <Form.Control
              as="select"
              name="unit"
              value={data.unit ? data.unit : ""}
              onChange={this.changeHandler}
            >
              <option></option>
              {unitList.map((t, key) => {
                return <option key={key}>{t.name}</option>;
              })}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Passwort</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={data.password ? data.password : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>{this.error()}</Form.Group>
          <Button variant="outline-success" type="submit">
            Speichern
          </Button>
          {this.state.userId ? (
            <Button
              variant="outline-danger"
              type="button"
              onClick={() => this.deleteUser()}
            >
              Löschen
            </Button>
          ) : null}
          <Button
            variant="outline-secondary"
            type="button"
            onClick={() => {
              this.props.history.push("/admin/users");
            }}
          >
            Schließen
          </Button>
        </Form>
      </div>
    );
  }
}

export default withRouter(User);
