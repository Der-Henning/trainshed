import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
//import styles from "../styles/styles.module.css";
import { ChartTrainings } from "../components";

class Statistics extends Component {
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
            <ChartTrainings {...this.props} type="MRM" />
          </Col>
          <Col>
            <ChartTrainings {...this.props} type="CRM" />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withRouter(Statistics);
