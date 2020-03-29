import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Table, Button } from "react-bootstrap";
import Axios from "axios";
import styles from "../styles/styles.module.css";
import { Trainees, Trainers } from "../components";

class Bookings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null,
      trainingId: this.props.match.params.id
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
    else {
      this.fetchTraining();
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

  error = () => {
    const { error } = this.state;
    if (error) return <div className={styles.error}>{error.message}</div>;
    return null;
  };

  render() {
    const { data, trainingId } = this.state;
    if (!data) return <div></div>;
    return (
      <div>
        <h3>Training</h3>
        <div className="table-responsive">
          <Table>
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
        <Button
          variant="outline-dark"
          onClick={() => {
            this.props.history.push({
              pathname: "/training/" + trainingId,
              state: { backRoute: this.props.location.pathname }
            });
          }}
        >
          Training bearbeiten
        </Button>
        <div className="col-xs-12" style={{ height: "50px" }} />
        <Trainees
          trainingId={trainingId}
          trainees={data.Trainees}
          fetchTraining={this.fetchTraining}
          {...this.props}
        />
        <Trainers
          trainingId={trainingId}
          trainers={data.Trainers}
          fetchTraining={this.fetchTraining}
          {...this.props}
        />
      </div>
    );
  }
}

export default withRouter(Bookings);
