import React, {Component, useState, useEffect} from 'react'
import UserList from './UserList.js'
import socket from './Socket'
import { Paper, TextField } from '@material-ui/core'

const ChatBox = props => {
    const msgEndRef = React.createRef();
    const [message,setMessage] = useState("");

    const scrollToBottom = () => {
        msgEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
      scrollToBottom();
    },[props.messages])

    const sendMessage = event => {
      if(event.which == 13 && message.trim() != "") {
        socket.emit("newMessage",message,sessionStorage.getItem("roomID"))
        setMessage("")
      }
    }

    return(
        <Paper elevation={2} className="chatContainer">
            <p className="error">{props.chatError}</p>
            <UserList/>
            <div className="messageBox">
                {props.messages.map((item,index) =>
                    <div
                    className={"message " +
                    (item.sentFromHere ? "messageFromHere" : "messageFromOther")}
                    style={{"backgroundColor" : item.color}} key={index}>
                        <div className="messageContent">
                            <div className="messageHeader">
                                <p className="messageUser"><b>{item.user}</b></p>
                                <p className="messageTime"><b>{item.time}</b></p>
                            </div>
                            <p className="messageText">{item.text}</p>
                        </div>
                    </div>
                  )}
                <div ref={msgEndRef}/>
            </div>
            <TextField
            id="chatInput"
            variant="outlined"
            name="localMessage"onChange={event => setMessage(event.target.value)}
            onKeyPress={event => sendMessage(event)}
            value={message}
            placeholder="Send a message to the room"
            />
        </Paper>
    )
}


export default ChatBox
