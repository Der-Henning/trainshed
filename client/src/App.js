import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { withRouter } from "react-router-dom";
import {
  Home,
  Login,
  Trainings,
  Training,
  Units,
  Admin,
  Users,
  User,
  Person,
  Persons,
  Bookings,
  TrainingTypes,
  Trainers,
  Statistics
} from "./pages";
import { Header } from "./components";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      api: "/api/v1"
    };
    if (!this.props.token) this.props.history.push("/login");
  }

  setToken = token => {
    this.setState({ token: token });
  };

  render() {
    const { api, token } = this.state;
    return (
      <div className="App">
        <Router>
          <Header setToken={this.setToken} token={token} />
          <Switch>
            <Route exact path="/" render={() => <Home token={token} />} />
            <Route
              path="/login"
              render={() => <Login api={api} setToken={this.setToken} />}
            />
            <Route
              path="/trainings"
              render={() => <Trainings api={api} token={token} />}
            />
            <Route
              path="/training/:id/bookings"
              render={() => <Bookings api={api} token={token} />}
            />
            <Route
              path="/training/:id"
              render={() => <Training api={api} token={token} />}
            />
            <Route
              path="/training"
              render={() => <Training api={api} token={token} />}
            />
            <Route
              path="/persons"
              render={() => <Persons api={api} token={token} />}
            />
            <Route
              path="/person/:id"
              render={() => <Person api={api} token={token} />}
            />
            <Route
              path="/person"
              render={() => <Person api={api} token={token} />}
            />
            <Route
              path="/admin/trainingtypes"
              render={() => <TrainingTypes api={api} token={token} />}
            />
            <Route
              path="/trainers"
              render={() => <Trainers api={api} token={token} />}
            />
            <Route
              path="/statistics"
              render={() => <Statistics api={api} token={token} />}
            />
            <Route
              path="/admin/units"
              render={() => <Units api={api} token={token} />}
            />
            <Route
              path="/admin/users"
              render={() => <Users api={api} token={token} />}
            />
            <Route
              path="/admin/user/:id"
              render={() => <User api={api} token={token} />}
            />
            <Route
              path="/admin/user"
              render={() => <User api={api} token={token} />}
            />
            <Route
              path="/admin"
              render={() => <Admin api={api} token={token} />}
            />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default withRouter(App);
