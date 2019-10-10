import React, { Component, Fragment } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NavBar from "../Layouts/NavBar";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

export default class Template extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

            //Variable to hold data to send to the server
            isGoing: true,
            numberOfGuests: 2,
            val: "example text",

            //Variables to hold requested data.
            apiResponse: "", list: []
        };

        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        fetch('http://localhost:9000/example', { method: 'POST', body: JSON.stringify({word: "bird"})});
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
        [name]: value
        });
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
        //This will send your data as a standalone function.
        function request() {
            let remote = 'http://localhost:9000';

            //Specific the correct page, in this case it is /template
            let destination = remote + '/template';
            let headers = { 'Accept': 'application/json', 'Content-Type': 'application/json'};
            
            //Add your data to send back here
            let data = {word: "bird", otherField: 0, val: true};

            fetch(destination, { 
                method: 'POST', 
                headers: headers,
                body: JSON.stringify(data)}
            );
        }

        return (
        <div>
        <button onClick={request}>POST request</button>

        <h1>Send Data to the Server.</h1>
        <form action="http://localhost:9000/template" method="POST">
          <input type="text" name="val" value = {this.state.val} onChange={this.handleInputChange}/>
          <br />
          <label>Is Going:
            <input
                name="isGoing"
                type="checkbox"
                checked={this.state.isGoing}
                onChange={this.handleInputChange} />
            </label>
            <br />
            <label>Number of guests:
            <input
                name="numberOfGuests"
                type="number"
                value={this.state.numberOfGuests}
                onChange={this.handleInputChange} />
            </label>
            <br />
            <button type="submit">Submit</button>
        </form>
        <br />


        <h1>Recieve Data from the Server</h1>
        {/* Start of Mitch's Changes 4/10/19 */}
        <p>/list as string: {string}</p>
        <p>/list as array/json: {list.toString()}</p>

        <div className="App">
          <h3>List of Items</h3>
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
        </div>
        );
    }
}