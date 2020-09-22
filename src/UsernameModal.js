import React, { useState } from 'react'
import socket from './Socket'
import { Button } from '@material-ui/core'

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

  socket.on("clientChangeNameReturn",response => {
    response.error && setNameError(response.error)
  })
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
            onKeyPress={event => event.which === 13 ? changeUsername() : undefined}
            />
            <Button variant="contained" color="primary" onClick={changeUsername}>Submit</Button>
        </div>
    </div>
  )
}
export default UsernameModal
