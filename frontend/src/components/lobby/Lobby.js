import React from "react";
import { signInAnonymously, getIdToken } from "firebase/auth";
import { auth } from "../../lib/firebase-app";
import "./Lobby.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ username: event.target.value });
  }

  handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    console.log("A name was submitted: " + this.state.username);
    const credentials = await signInAnonymously(auth);
    // await updateCurrentUser(auth, { displayName: this.state.username });
    console.log("User signed in anonymously with uid:", credentials.user.uid);
    const token = await getIdToken(credentials.user);

    await fetch("/lobby/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: this.state.username, token }),
    }).then(()=>{
      window.location.href = "/gamefield";
    });
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={this.state.username}
          onChange={this.handleChange}
        />
        <br />
        <input
          type="submit"
          id="create-lobby"
          name="create-lobby"
          value="create a lobby"
        />
        <br />
        <input
          type="submit"
          id="join-lobby"
          name="join-lobby"
          value="join a lobby"
        />
      </form>
    );
  }
}
