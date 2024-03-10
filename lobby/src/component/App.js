import React from "react";
import './App.css';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission
        console.log('A name was submitted: ' + this.state.value)
    }
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" value={this.state.value} onChange={this.handleChange}/>
                <br/>
                <input type="submit" id="create-lobby" name="create-lobby" value="create a lobby"/>
                <br/>
                <input type="submit" id="join-lobby" name="join-lobby" value="join a lobby"/>
            </form>
        );
    }
}