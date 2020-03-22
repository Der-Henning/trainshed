import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Table, Form } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class Bookings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null,
      trainees: [],
      trainingId: this.props.match.params.id,
      traineeStatusList: [],
      persNum: ""
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
    else {
      this.fetchTraineeStatusList();
      this.fetchTraining();
      this.fetchTrainees();
    }
  }

  fetchTraining = () => {
    const { api, token } = this.props;
    const { trainingId } = this.state;
    this.setState({ error: null });
    Axios.get(api + "/training/" + trainingId, {
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

  fetchTrainees = () => {
    const { api, token } = this.props;
    Axios.get(api + "/trainee", {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({ trainees: res.data.data });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

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
    const { api, token } = this.props;
    const { trainingId, trainees, persNum } = this.state;
    const trainee = trainees.find(t => t.Person.persNum === parseInt(persNum));
    if (trainee) {
      const traineeId = trainee.id;
      this.setState({ error: null });
      Axios.post(
        api + "/training/" + trainingId + "/trainee/" + traineeId,
        qs.stringify({}),
        {
          headers: { "x-access-token": token }
        }
      )
        .then(() => {
          this.fetchTraining();
        })
        .catch(err => {
          if (err.response) this.setState({ error: err.response.data.status });
        });
    } else {
      this.setState({ error: { message: "Person does not exist" } });
    }
  };

  removeTrainee = id => {
    const { api, token } = this.props;

    this.setState({ error: null });
    Axios.delete(api + "/training/trainee/" + id, {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.fetchTraining();
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  statusChangeaHandler = e => {
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
        this.fetchTraining();
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
    const { data, persNum, traineeStatusList } = this.state;
    return (
      <div>
        <h3>Training</h3>
        <div className="table-responsive">
          <Table className="table-hover">
            <thead>
              <tr>
                <th>Start</th>
                <th>Ende</th>
                <th>Trainingstyp</th>
                <th>min. Teilnehmer</th>
                <th>max. Teilnehmer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data ? (
                <tr>
                  <td>{data.startDate}</td>
                  <td>{data.endDate}</td>
                  <td>{data.trainingType}</td>
                  <td>{data.minTrainees}</td>
                  <td>{data.maxTrainees}</td>
                  <td>{data.status}</td>
                </tr>
              ) : (
                <tr></tr>
              )}
            </tbody>
          </Table>
        </div>
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
          <Button type="submit">Person buchen</Button>
          <Button
            onClick={() =>
              this.props.history.push({
                pathname: "/person",
                state: { backRoute: this.props.location.pathname }
              })
            }
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
              {data ? (
                data.Trainees.map((t, key) => {
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
                            value={data.Trainees[key].status}
                            onChange={this.statusChangeaHandler}
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

export default withRouter(Bookings);
