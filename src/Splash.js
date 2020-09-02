import React, {Component} from 'react';
import socket from './Socket'

const Splash = () =>  {

        const createRoom = () => {
            socket.emit("requestCreateNewRoom",socket.id)
        }

        return (
            <div className="verticalCenter horizontalCenter splash">
                <div className="splashContentContainer">
                    <h1>Create a room, Send the link to your friends and watch together!</h1>
                    <button className="createRoomButton showPointerOnHover" onClick={createRoom}>Create Room</button>
                </div>
            </div>
        )
}

export default Splash
