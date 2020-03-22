import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button, Table } from "react-bootstrap";
import Axios from "axios";
import styles from "../styles/styles.module.css";

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
    else this.fetchUsers();
  }

  fetchUsers = () => {
    const { api, token } = this.props;
    Axios.get(api + "/user", {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  error = () => {
    const { error } = this.state;
    if (error)
      return <Form.Text className={styles.error}>{error.message}</Form.Text>;
    return null;
  };

  render() {
    const { data } = this.state;
    return (
      <div>
        <Button onClick={() => this.props.history.push("/admin/user")}>
          Nutzer anlegen
        </Button>
        <Table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Mail</th>
              <th>Nutzerlevel</th>
              <th>Einheit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data ? (
              data.map((t, key) => {
                return (
                  <tr key={key}>
                    <td>{t.username}</td>
                    <td>{t.mail}</td>
                    <td>{t.level}</td>
                    <td>{t.unit}</td>
                    <td>
                      <Button
                        variant="outline-dark"
                        onClick={() => {
                          this.props.history.push("/admin/user/" + t.id);
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
    );
  }
}

export default withRouter(Users);
