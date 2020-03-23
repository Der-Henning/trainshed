import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";
import styles from "../styles/styles.module.css";

class Admin extends Component {
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
              onClick={() => this.props.history.push("/admin/units")}
              variant="outline-primary"
              className={styles.bigButton}
            >
              Einheiten bearbeiten
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => this.props.history.push("/admin/users")}
              variant="outline-primary"
              className={styles.bigButton}
            >
              Nutzer bearbeiten
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => this.props.history.push("/admin/trainingtypes")}
              variant="outline-primary"
              className={styles.bigButton}
            >
              Training Typen bearbeiten
            </Button>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withRouter(Admin);
