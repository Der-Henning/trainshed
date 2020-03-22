import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button, Table } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class Units extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null,
      formData: {
        name: ""
      }
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
    else this.fetchUnits();
  }

  fetchUnits = () => {
    const { api, token } = this.props;
    Axios.get(api + "/unit", {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  deleteUnit = id => {
    const { api, token } = this.props;
    Axios.delete(api + "/unit/" + id, {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.fetchUnits();
      })
      .catch(err => {
        if (err.response) alert(err.response.data.status);
      });
  };

  submitHandler = e => {
    e.preventDefault();
    const { api, token } = this.props;
    const { formData } = this.state;
    this.setState({ error: null });
    Axios.post(api + "/unit", qs.stringify(formData), {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.fetchUnits();
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  changeHandler = e => {
    var { formData } = this.state;
    const { name, value } = e.target;
    formData[name] = value;
    this.setState({ formData });
  };

  error = () => {
    const { error } = this.state;
    if (error)
      return <Form.Text className={styles.error}>{error.message}</Form.Text>;
    return null;
  };

  render() {
    const { data, formData } = this.state;
    return (
      <div>
        <h3>Einheiten</h3>
        <Form onSubmit={this.submitHandler} className={styles.wrapper}>
          <Form.Group>
            <Form.Label>neue Einheit</Form.Label>
            <Form.Control
              name="name"
              type="text"
              value={formData.name}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>{this.error()}</Form.Group>
          <Button variant="outline-success" type="submit">
            Hinzufügen
          </Button>
        </Form>

        <Table className={styles.wrapper}>
          <thead>
            <tr>
              <th>Einheit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data ? (
              data.map((t, key) => {
                return (
                  <tr key={key}>
                    <td>{t.name}</td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Wollen Sie wirklich die Einheit " +
                                t.name +
                                " löschen?"
                            )
                          )
                            this.deleteUnit(t.id);
                        }}
                      >
                        löschen
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

export default withRouter(Units);
