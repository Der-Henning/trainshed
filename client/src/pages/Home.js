import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";
import styles from "../styles/styles.module.css";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  componentDidMount() {
    if (!this.props.token) this.props.history.push("/login");
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <Button
              onClick={() => this.props.history.push("/trainings")}
              variant="outline-primary"
              className={styles.bigButton}
            >
              Trainings
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => this.props.history.push("/persons")}
              variant="outline-primary"
              className={styles.bigButton}
            >
              Personen
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withRouter(Home);
