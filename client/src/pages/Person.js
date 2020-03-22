import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class Person extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: {
        name: "",
        givenName: "",
        persNum: "",
        rank: "",
        mail: "",
        unit: "",
        UnitId: null
      },
      personId: this.props.match.params.id,
      unitList: [],
      saved: true
    };
  }

  fetchPerson = () => {
    const { api, token } = this.props;
    const { personId } = this.state;
    this.setState({ error: null });
    Axios.get(api + "/person/" + personId, {
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

  addPerson = () => {
    const { api, token } = this.props;
    const { data } = this.state;
    this.setState({ error: null });
    Axios.post(api + "/person", qs.stringify(data), {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({
          data: res.data.data,
          personId: res.data.data.id,
          error: res.data.status,
          saved: true
        });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  updatePerson = () => {
    const { api, token } = this.props;
    const { data, personId } = this.state;
    this.setState({ error: null });
    Axios.put(
      api + "/person/" + personId,
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
          error: res.data.status,
          saved: true
        });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  deletePerson = () => {
    const { api, token } = this.props;
    const { personId } = this.state;
    Axios.delete(api + "/person/" + personId, {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.props.history.push("/persons");
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  submitHandler = e => {
    e.preventDefault();
    if (this.state.personId) this.updatePerson();
    else this.addPerson();
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
    if (name === "unit")
      data["UnitId"] = e.target.childNodes[e.target.selectedIndex].getAttribute(
        "data-id"
      );
    data[name] = value;
    this.setState({ data, saved: false });
  };

  closeForm = () => {
    const { saved } = this.state;
    const route =
      this.props.location.state && this.props.location.state.backRoute
        ? this.props.location.state.backRoute
        : "/persons";
    if (saved || window.confirm("Schließen ohne zu speichern?"))
      this.props.history.push(route);
  };

  componentDidMount() {
    const { personId } = this.state;
    this.fetchUnitList();
    if (personId) this.fetchPerson();
  }

  render() {
    const { data, personId, unitList } = this.state;
    return (
      <div>
        <h3>{personId ? "Person bearbeiten" : "neue Person anlegen"}</h3>
        <Form onSubmit={this.submitHandler} className={styles.wrapper}>
          <Form.Group>
            <Form.Label>Personalnummer</Form.Label>
            <Form.Control
              name="persNum"
              type="text"
              value={data.persNum ? data.persNum : ""}
              autoFocus
              required
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Dienstgrad</Form.Label>
            <Form.Control
              name="rank"
              type="text"
              value={data.rank ? data.rank : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Vorname</Form.Label>
            <Form.Control
              name="givenName"
              type="text"
              required
              value={data.givenName ? data.givenName : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Nachname</Form.Label>
            <Form.Control
              type="text"
              name="name"
              required
              value={data.name ? data.name : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>E-Mail</Form.Label>
            <Form.Control
              type="text"
              name="mail"
              value={data.mail ? data.mail : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Einheit</Form.Label>
            <Form.Control
              as="select"
              name="unit"
              required
              value={data.unit ? data.unit : ""}
              onChange={this.changeHandler}
            >
              <option></option>
              {unitList.map(t => {
                return (
                  <option key={t.id} data-id={t.id}>
                    {t.name}
                  </option>
                );
              })}
            </Form.Control>
          </Form.Group>
          <Form.Group>{this.error()}</Form.Group>
          <Button variant="outline-success" type="submit">
            Speichern
          </Button>
          {this.state.personId ? (
            <Button
              variant="outline-danger"
              type="button"
              onClick={() => this.deletePerson()}
            >
              Löschen
            </Button>
          ) : null}
          <Button
            variant="outline-secondary"
            type="button"
            onClick={() => {
              this.closeForm();
            }}
          >
            Schließen
          </Button>
        </Form>
      </div>
    );
  }
}

export default withRouter(Person);
