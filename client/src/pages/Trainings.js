import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Table } from "react-bootstrap";
import Axios from "axios";

class Trainings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
    else this.fetchTrainings();
  }

  fetchTrainings = () => {
    const { api, token } = this.props;
    Axios.get(api + "/training", {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  bookingList = t => {
    var counts = {
      queued: 0,
      set: 0
    };
    t.Counts.forEach(e => {
      counts[e.status] = e.count;
    });
    return (
      <Table
        className="table-sm table-borderless small"
        style={{ margin: "0" }}
      >
        <tbody>
          <tr>
            <td>gebucht:</td>
            <td>{counts.set}</td>
          </tr>
          <tr>
            <td>frei:</td>
            <td>{t.maxTrainees - counts.set}</td>
          </tr>
          <tr>
            <td>warteliste:</td>
            <td>{counts.queued}</td>
          </tr>
        </tbody>
      </Table>
    );
  };

  render() {
    const { data } = this.state;
    return (
      <div>
        <Button onClick={() => this.props.history.push("/training")}>
          Training anlegen
        </Button>
        <div className="table-responsive">
          <Table className="table-hover">
            <thead>
              <tr>
                <th>Start</th>
                <th>Ende</th>
                <th>Trainingstyp</th>
                <th>Buchungen</th>
                <th>Status</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data ? (
                data.map((t, key) => {
                  return (
                    <tr key={key}>
                      <td className="align-middle">{t.startDate}</td>
                      <td className="align-middle">{t.endDate}</td>
                      <td className="align-middle">{t.trainingType}</td>
                      <td className="align-middle" style={{ padding: "0" }}>
                        {this.bookingList(t)}
                      </td>
                      <td className="align-middle">{t.status}</td>
                      <td className="align-middle">
                        <Button
                          variant="outline-dark"
                          onClick={() => {
                            this.props.history.push("/training/" + t.id);
                          }}
                        >
                          bearbeiten
                        </Button>
                      </td>
                      <td className="align-middle">
                        <Button
                          variant="outline-dark"
                          onClick={() => {
                            this.props.history.push(
                              "/training/" + t.id + "/bookings"
                            );
                          }}
                        >
                          buchen
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

export default withRouter(Trainings);
