import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class TrainingForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: {
        startDate: "",
        endDate: "",
        minTrainees: 6,
        maxTrainees: 12,
        status: "open",
        reason: "",
        trainingType: ""
      },
      trainingTypes: [],
      statusList: [],
      reasonList: [],
      trainingId: this.props.match.params.id,
      reason: false,
      saved: true
    };
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
          newTraining: false,
          error: res.data.status,
          reason: res.data.data.status === "cancelled" ? true : false
        });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  fetchStatusList = () => {
    const { api, token } = this.props;
    Axios.get(api + "/training/statusList", {
      headers: { "x-access-token": token }
    }).then(res => {
      this.setState({ statusList: res.data.data });
    });
  };

  fetchReasonList = () => {
    const { api, token } = this.props;
    Axios.get(api + "/training/reasonList", {
      headers: { "x-access-token": token }
    }).then(res => {
      this.setState({ reasonList: res.data.data });
    });
  };

  fetchTrainingTypes = () => {
    const { api, token } = this.props;
    Axios.get(api + "/trainingType", {
      headers: { "x-access-token": token }
    }).then(res => {
      this.setState({ trainingTypes: res.data.data });
    });
  };

  addTraining = () => {
    const { api, token } = this.props;
    const { data } = this.state;
    this.setState({ error: null });
    Axios.post(api + "/training", qs.stringify(data), {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({
          data: res.data.data,
          newTraining: false,
          tainingId: res.data.data.id,
          error: res.data.status
        });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  updateTraining = () => {
    const { api, token } = this.props;
    const { data, trainingId } = this.state;
    this.setState({ error: null });
    Axios.put(
      api + "/training/" + trainingId,
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
          newTraining: false,
          error: res.data.status
        });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  deleteTraining = () => {
    const { api, token } = this.props;
    const { trainingId } = this.state;
    if (
      window.confirm("Das Training wird unwiederruflich gelöscht! Fortfahren?")
    ) {
      Axios.delete(api + "/training/" + trainingId, {
        headers: { "x-access-token": token }
      })
        .then(() => {
          this.props.history.push("/trainings");
        })
        .catch(err => {
          if (err.response) this.setState({ error: err.response.data.status });
        });
    }
  };

  submitHandler = e => {
    e.preventDefault();

    if (this.state.trainingId) this.updateTraining();
    else this.addTraining();
  };

  closeForm = () => {
    const { saved } = this.state;
    const route =
      this.props.location.state && this.props.location.state.backRoute
        ? this.props.location.state.backRoute
        : "/trainings";
    if (saved || window.confirm("Schließen ohne zu speichern?"))
      this.props.history.push(route);
  };

  error = () => {
    const { error } = this.state;
    if (error)
      return <Form.Text className={styles.error}>{error.message}</Form.Text>;
    return null;
  };

  changeHandler = e => {
    const { name, value } = e.target;
    var { data, reason } = this.state;
    var showReason =
      name === "status" ? (value === "cancelled" ? true : false) : reason;
    data[name] = value;
    this.setState({ data, reason: showReason, saved: false });
  };

  componentDidMount() {
    const { trainingId } = this.state;
    this.fetchTrainingTypes();
    this.fetchStatusList();
    this.fetchReasonList();
    if (trainingId) this.fetchTraining();
  }

  render() {
    const {
      trainingTypes,
      data,
      trainingId,
      statusList,
      reasonList
    } = this.state;
    return (
      <div>
        <h3>{trainingId ? "Training bearbeiten" : "neues Training anlegen"}</h3>
        <Form onSubmit={this.submitHandler} className={styles.wrapper}>
          <Form.Group>
            <Form.Label>Start</Form.Label>
            <Form.Control
              name="startDate"
              type="date"
              value={data.startDate ? data.startDate : ""}
              autoFocus
              required
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Ende</Form.Label>
            <Form.Control
              name="endDate"
              type="date"
              value={data.endDate ? data.endDate : ""}
              required
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Trainingstyp</Form.Label>
            <Form.Control
              as="select"
              name="trainingType"
              required
              value={data ? data.trainingType : ""}
              onChange={this.changeHandler}
            >
              <option></option>
              {trainingTypes.map((t, key) => {
                return <option key={key}>{t.type}</option>;
              })}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>maximale Teilnehmer</Form.Label>
            <Form.Control
              type="text"
              name="maxTrainees"
              value={data.maxTrainees ? data.maxTrainees : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>minimale Teilnehmer</Form.Label>
            <Form.Control
              type="text"
              name="minTrainees"
              value={data.minTrainees ? data.minTrainees : ""}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              value={data.status ? data.status : ""}
              onChange={this.changeHandler}
            >
              {statusList.map((status, key) => {
                return <option key={key}>{status}</option>;
              })}
            </Form.Control>
          </Form.Group>
          {this.state.reason ? (
            <Form.Group>
              <Form.Label>Ausfallgrund</Form.Label>
              <Form.Control
                as="select"
                name="reason"
                required
                value={data.reason ? data.reason : ""}
                onChange={this.changeHandler}
              >
                {reasonList.map((reason, key) => {
                  return <option key={key}>{reason}</option>;
                })}
              </Form.Control>
            </Form.Group>
          ) : null}
          <Form.Group>{this.error()}</Form.Group>
          <Button variant="outline-success" type="submit">
            Speichern
          </Button>
          {this.state.trainingId ? (
            <Button
              variant="outline-danger"
              type="button"
              onClick={() => this.deleteTraining()}
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

export default withRouter(TrainingForm);
