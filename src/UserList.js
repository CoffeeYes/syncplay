import React, { useState, useEffect } from 'react'
import socket from './Socket'

const UserList = () => {
    const [connectedUsers,setConnectedUsers] = useState([])

    useEffect(() => {
        socket.on("receiveConnectedUsers",users => {
            setConnectedUsers(users)
        })
    },[])

    return (
        <div className="userListContainer">
        <p className="connectedUserText">Connected Users :</p>
        {connectedUsers.map((item,index) => {
            return <p key={index} className="connectedUserText">{item},</p>
        })}
        </div>
    )
}
export default UserList
