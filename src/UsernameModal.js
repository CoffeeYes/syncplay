import React, { useState } from 'react'
import socket from './Socket'

const UsernameModal = () => {
  const [name,setName] = useState("");
  const [nameError,setNameError] = useState("");
  const changeUsername = () => {
    setNameError("")
    if(name.trim() === "") {
      return setNameError("name cannot be empty")
    }
    else if (name.length > 20) {
      return setNameError("name cannot be longer than 20 characters")
    }
    socket.emit("clientChangedUsername",name,sessionStorage.getItem("roomID"))
  }
  return (
    <div className="usernameModalFullscreen">
        <div className="usernameModalChoice">
            <p className="error">{nameError}</p>
            <p>Choose your Username</p>
            <input
            className="usernameChoiceInput inputFocus"
            name="changeName"
            value={name}
            onChange={event => setName(event.target.value)}
            onKeyPress={(event) => {return event.which == 13 ? changeUsername() : false}}
            />
            <button className="defaultButton changeNameButton" onClick={changeUsername}>Submit</button>
        </div>
    </div>
  )
}
export default UsernameModal
