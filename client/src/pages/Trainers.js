import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Table, Form } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class Trainers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null,
      persNum: "",
      trainers: []
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
    else this.fetchTrainers();
  }

  fetchTrainers = () => {
    const { api, token } = this.props;
    Axios.get(api + "/trainer", {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({ trainers: res.data.data });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  addTrainer = e => {
    e.preventDefault();
    const { api, token } = this.props;
    const { persNum } = this.state;

    Axios.get(api + "/person/findByPN/" + persNum, {
      headers: { "x-access-token": token }
    })
      .then(person => {
        Axios.post(api + "/trainer/" + person.data.data.id, qs.stringify({}), {
          headers: { "x-access-token": token }
        })
          .then(res => {
            this.fetchTrainers();
          })
          .catch(err => {
            if (err.response)
              this.setState({ error: err.response.data.status });
          });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  persNumChangeHandler = e => {
    this.setState({ persNum: e.target.value });
  };

  trainerChangeHandler = e => {
    e.preventDefault();
    const { api, token } = this.props;
    const { checked } = e.target;
    const trainerId = e.target.getAttribute("data-trainerid");
    const field = e.target.getAttribute("data-field");

    this.setState({ error: null });
    Axios.put(
      api + "/trainer/" + trainerId,
      qs.stringify({ [field]: checked }),
      {
        headers: { "x-access-token": token }
      }
    )
      .then(() => {
        this.fetchTrainers();
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  render() {
    const { trainers, persNum } = this.state;
    return (
      <div>
        <h3>Trainer</h3>
        <Form onSubmit={this.addTrainer} className={styles.wrapper}>
          <Form.Group>
            <Form.Label>Personalnummer</Form.Label>
            <Form.Control
              name="persNum"
              type="text"
              value={persNum}
              autoFocus
              required
              onChange={this.persNumChangeHandler}
            />
          </Form.Group>
          <Button
            type="submit"
            variant="outline-primary"
            className={styles.button}
          >
            Trainer anlegen
          </Button>
          <Button
            onClick={() =>
              this.props.history.push({
                pathname: "/person",
                state: { backRoute: this.props.location.pathname }
              })
            }
            variant="outline-secondary"
            className={styles.button}
          >
            Person anlegen
          </Button>
        </Form>
        <div className="table-responsive">
          <Table className="table-hover table-sm">
            <thead>
              <tr>
                <th>Personalnummer</th>
                <th>Dienstgrad</th>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Trainer</th>
                <th>Examiner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((t, key) => {
                return (
                  <tr key={key}>
                    <td className="align-middle">{t.persNum}</td>
                    <td className="align-middle">{t.rank}</td>
                    <td className="align-middle">{t.givenName}</td>
                    <td className="align-middle">{t.name}</td>
                    <td className="align-middle">
                      <Form.Check
                        type="checkbox"
                        data-trainerid={t.id}
                        data-field="bolTrainer"
                        checked={trainers[key].trainer}
                        onChange={this.trainerChangeHandler}
                      />
                    </td>
                    <td className="align-middle">
                      <Form.Check
                        type="checkbox"
                        data-trainerid={t.id}
                        data-field="bolExaminer"
                        checked={trainers[key].examiner}
                        onChange={this.trainerChangeHandler}
                      />
                    </td>
                    <td className="align-middle">
                      <Button
                        variant="outline-dark"
                        onClick={() => {
                          this.props.history.push({
                            pathname: "/person/" + t.id,
                            state: { backRoute: this.props.location.pathname }
                          });
                        }}
                      >
                        bearbeiten
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default withRouter(Trainers);
