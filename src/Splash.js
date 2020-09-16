import React, {Component} from 'react';
import socket from './Socket'
import { Button } from '@material-ui/core'

const Splash = () =>  {

  const createRoom = () => {
      socket.emit("requestCreateNewRoom",socket.id)
  }

  return (
    <div className="verticalCenter horizontalCenter splash">
      <div className="splashContentContainer">
        <h1>Create a room, Send the link to your friends and watch together!</h1>
        <Button
        variant="contained"
        color="primary"
        onClick={createRoom}>
        Create Room
        </Button>
      </div>
    </div>
  )
}

export default Splash
