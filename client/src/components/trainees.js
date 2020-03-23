import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Table, Form } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class Trainees extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      traineeStatusList: [],
      persNum: ""
    };
  }

  componentDidMount() {
    this.fetchTraineeStatusList();
  }

  fetchTraineeStatusList = () => {
    const { api, token } = this.props;
    Axios.get(api + "/training/traineeStatusList", {
      headers: { "x-access-token": token }
    }).then(res => {
      this.setState({ traineeStatusList: res.data.data });
    });
  };

  persNumChangeHandler = e => {
    this.setState({ persNum: e.target.value });
  };

  addTrainee = e => {
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
            "/trainee/" +
            res.data.data.TraineeId,
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

  removeTrainee = id => {
    const { api, token } = this.props;

    this.setState({ error: null });
    Axios.delete(api + "/training/trainee/" + id, {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.props.fetchTraining();
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  traineeStatusChangeaHandler = e => {
    e.preventDefault();
    const { api, token } = this.props;
    const { value } = e.target;
    const trainingtraineeid = e.target.getAttribute("data-trainingtraineeid");

    this.setState({ error: null });
    Axios.put(
      api + "/training/trainee/" + trainingtraineeid,
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
    const { persNum, traineeStatusList } = this.state;
    const { trainees } = this.props;
    return (
      <div>
        <h3>Trainees</h3>
        <Form onSubmit={this.addTrainee} className={styles.wrapper}>
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
            Person buchen
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
        {this.error()}
        <div className="table-responsive">
          <Table className="table-hover">
            <thead>
              <tr>
                <th>Personalnummer</th>
                <th>Dienstgrad</th>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Einheit</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trainees ? (
                trainees.map((t, key) => {
                  return (
                    <tr key={key}>
                      <td>{t.persNum}</td>
                      <td>{t.rank}</td>
                      <td>{t.givenName}</td>
                      <td>{t.name}</td>
                      <td>{t.unit}</td>
                      <td>
                        {
                          <Form.Control
                            as="select"
                            data-trainingtraineeid={t.id}
                            value={trainees[key].status}
                            onChange={this.traineeStatusChangeaHandler}
                            style={{minWidth: "100px"}}
                          >
                            {traineeStatusList.map((s, key) => {
                              return <option key={key}>{s}</option>;
                            })}
                          </Form.Control>
                        }
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          onClick={() => {
                            this.removeTrainee(t.id);
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

export default withRouter(Trainees);
