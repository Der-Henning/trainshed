import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Table } from "react-bootstrap";
import Axios from "axios";

class Persons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
    else this.fetchPersons();
  }

  fetchPersons = () => {
    const { api, token } = this.props;
    Axios.get(api + "/person", {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  render() {
    const { data } = this.state;
    return (
      <div>
        <Button onClick={() => this.props.history.push("/person")}>
          Person anlegen
        </Button>
        <div className="table-responsive">
          <Table className="table-hover table-sm">
            <thead>
              <tr>
                <th>Personalnummer</th>
                <th>Dienstgrad</th>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Einheit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data ? (
                data.map((t, key) => {
                  return (
                    <tr key={key}>
                      <td className="align-middle">{t.persNum}</td>
                      <td className="align-middle">{t.rank}</td>
                      <td className="align-middle">{t.givenName}</td>
                      <td className="align-middle">{t.name}</td>
                      <td className="align-middle">{t.unit}</td>
                      <td className="align-middle">
                        <Button
                          variant="outline-dark"
                          onClick={() => {
                            this.props.history.push("/person/" + t.id);
                          }}
                        >
                          bearbeiten
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

export default withRouter(Persons);
