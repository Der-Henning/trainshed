import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Form, Button, Table } from "react-bootstrap";
import Axios from "axios";
import qs from "qs";
import styles from "../styles/styles.module.css";

class TrainingTypes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      data: null,
      formData: {
        type: ""
      }
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
    else this.fetchTrainingTypes();
  }

  fetchTrainingTypes = () => {
    const { api, token } = this.props;
    Axios.get(api + "/trainingType", {
      headers: { "x-access-token": token }
    })
      .then(res => {
        this.setState({ data: res.data.data });
      })
      .catch(err => {
        if (err.response) this.setState({ error: err.response.data.status });
      });
  };

  deleteTrainingType = id => {
    const { api, token } = this.props;
    Axios.delete(api + "/trainingType/" + id, {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.fetchTrainingTypes();
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
    Axios.post(api + "/trainingType", qs.stringify(formData), {
      headers: { "x-access-token": token }
    })
      .then(() => {
        this.setState({ formData: { type: "" } });
        this.fetchTrainingTypes();
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
      <div className={styles.wrapper}>
        <h3>Training Typen</h3>
        <div className="col-xs-12" style={{ height: "50px" }} />
        <Form onSubmit={this.submitHandler}>
          <Form.Group>
            <Form.Label>neuer Training Typ</Form.Label>
            <Form.Control
              name="type"
              type="text"
              autoFocus
              value={formData.type}
              onChange={this.changeHandler}
            />
          </Form.Group>
          <Form.Group>{this.error()}</Form.Group>
          <Button variant="outline-success" type="submit">
            Hinzufügen
          </Button>
        </Form>
        <div className="col-xs-12" style={{ height: "50px" }} />
        <Table className="table-sm">
          <thead>
            <tr>
              <th>Training Typ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data ? (
              data.map((t, key) => {
                return (
                  <tr key={key}>
                    <td>{t.type}</td>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Wollen Sie wirklich den Typ " +
                                t.name +
                                " löschen?"
                            )
                          )
                            this.deleteTrainingType(t.id);
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

export default withRouter(TrainingTypes);
