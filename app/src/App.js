import React, { Component, Fragment } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NavBar from "./Components/Layouts/NavBar";
import Login from "./Components/Pages/Login";
import SignUp from "./Components/Pages/SignUp";
import Product from "./Components/Pages/Product";
import Template from "./Components/Pages/Template";


export default class extends Component {
  render() {
    return (
      <Fragment>
        <Router>
          <NavBar />
          <div>
            <Switch>
              <Route exact path='/' component={Login} />
              <Route exact path='/Login' component={Login} />
              <Route path='/SignUp' component={SignUp} />
              <Route path='/Product' component={Product} />
              <Route path='/Template' component={Template} /> {/*Added by Mitch*/}
            </Switch>
          </div>
        </Router>
      </Fragment>
    );
  }
}
