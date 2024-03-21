import React from "react";
import { useState } from "react";
import "./Lobby.css";

export default function App() {

  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState(0);

  const handleUsernameChange = (event) => {
    console.log(event);
   setUsername(event.target.value);
  }
  const handleLobbyChange = (event) => {
    setSessionId(event.target.value);
  }


  const handleSubmit = async (event) => {
    //const credentials = await signInAnonymously(auth);
    // await updateCurrentUser(auth, { displayName: this.state.username });
    //console.log("User signed in anonymously with uid:", credentials.user.uid);
    //const token = await getIdToken(credentials.user);
    localStorage.setItem(sessionId, username + '_' + sessionId);
    window.location.href = "/gamefield";

    // await fetch("/lobby/join", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ username: this.state.username }),
    // }).then(()=>{
    //   window.location.href = "/gamefield";
    // });
  };
  return (
      <form onSubmit={()=>handleSubmit()}>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e)=>handleUsernameChange(e)}
        />
        <input
          type="text"
          id="lobby"
          name="lobby"
          value={sessionId}
          onChange={(e)=>handleLobbyChange(e)}
        />
        <br />
        <button
        type="submit"
          id="create-lobby"
          name="create-lobby"
          onChange={(e)=>handleSubmit(e)}

        >Csatlakozas</button>
      </form> 
)}
