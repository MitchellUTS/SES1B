import React, { Component, Fragment } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NavBar from "./Components/Layouts/NavBar";
import Login from "./Components/Pages/Login";
import SignUp from "./Components/Pages/SignUp";
import Product from "./Components/Pages/Product";


export default class extends Component {
  constructor(props) {
    super(props);
    this.state = { apiResponse: "", list: [] };
  }
  
  callAPI() {
    fetch("http://localhost:9000/list")
        .then(res => res.text())
        .then(res => this.setState({ apiResponse: res }));
    fetch("http://localhost:9000/list")
        .then(res => res.json())
        .then(res => this.setState({ list: res }));
  }
  
  componentWillMount() {
    this.callAPI();
  }
  render() {
    let list = this.state.list;
    let string = this.state.apiResponse; 
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
            </Switch>
          </div>

          {/* Start of Mitch's Changes 4/10/19 */}
          <p>/list as string: {string}</p>
          <p>/list as array/json: {list.toString()}</p>

          <div className="App">
            <h1>List of Items</h1>
            {/* Check to see if any items are found*/}
            {list.length ? (
              <div>
                {/* Render the list of items */}
                {list.map((item) => {
                  return(
                    <div>
                      {item}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <h2>No List Items Found</h2>
              </div>
            )
          }
          </div>

          {/* End of Mitch's Changes 4/10/19 */}
        </Router>
      </Fragment>
    );
  }
}
