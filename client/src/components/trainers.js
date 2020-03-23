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
      trainerStatusList: [],
      persNum: ""
    };
  }

  componentDidMount() {
    this.fetchTrainerStatusList();
  }

  fetchTrainerStatusList = () => {
    const { api, token } = this.props;
    Axios.get(api + "/training/trainerStatusList", {
      headers: { "x-access-token": token }
    }).then(res => {
      this.setState({ trainerStatusList: res.data.data });
    });
  };

  persNumChangeHandler = e => {
    this.setState({ persNum: e.target.value });
  };

  addTrainer = e => {
    e.preventDefault();
    const { api, token, trainingId } = this.props;
    const { persNum } = this.state;

    Axios.get(api + "/person/findByPN/" + persNum, {
      headers: { "x-access-token": token }
    })
      .then(res => {
        Axios.post(
          api +
            "/training/" +
            trainingId +
            "/trainer/" +
            res.data.data.TrainerId,
          qs.stringify({}),
          {
            headers: { "x-access-token": token }
          }
        )
          .then(() => {
            this.props.fetchTraining();
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

  removeTrainer = id => {
    const { api, token } = this.props;

    this.setState({ error: null });
    Axios.delete(api + "/training/trainer/" + id, {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.props.fetchTraining();
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  trainerStatusChangeHandler = e => {
    e.preventDefault();
    const { api, token } = this.props;
    const { value } = e.target;
    const trainingtrainerid = e.target.getAttribute("data-trainingtrainerid");

    this.setState({ error: null });
    Axios.put(
      api + "/training/trainer/" + trainingtrainerid,
      qs.stringify({ status: value }),
      {
        headers: { "x-access-token": token }
      }
    )
      .then(() => {
        this.props.fetchTraining();
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  error = () => {
    const { error } = this.state;
    if (error) return <div className={styles.error}>{error.message}</div>;
    return null;
  };

  render() {
    const { persNum, trainerStatusList } = this.state;
    const { trainers } = this.props;
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
            Trainer buchen
          </Button>
          <Button
            onClick={() =>
              this.props.history.push({
                pathname: "/trainers",
                state: { backRoute: this.props.location.pathname }
              })
            }
            variant="outline-secondary"
            className={styles.button}
          >
            Trainer verwalten
          </Button>
        </Form>
        {this.error()}
        <div className="table-responsive">
          <Table className="table-hover">
            <thead>
              <tr>
                <th>Personalnummer</th>
                <th>Dienstgrad</th>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Trainer</th>
                <th>Examiner</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trainers ? (
                trainers.map((t, key) => {
                  return (
                    <tr key={key}>
                      <td>{t.persNum}</td>
                      <td>{t.rank}</td>
                      <td>{t.givenName}</td>
                      <td>{t.name}</td>
                      <td>{t.trainer ? "ja" : "nein"}</td>
                      <td>{t.examiner ? "ja" : "nein"}</td>
                      <td>
                        {
                          <Form.Control
                            as="select"
                            data-trainingtrainerid={t.id}
                            value={trainers[key].status || ""}
                            onChange={this.trainerStatusChangeHandler}
                            style={{minWidth: "100px"}}
                          >
                            {trainerStatusList.map((s, key) => {
                              return <option key={key}>{s}</option>;
                            })}
                          </Form.Control>
                        }
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          onClick={() => {
                            this.removeTrainer(t.id);
                          }}
                        >
                          stornieren
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default withRouter(Trainers);
