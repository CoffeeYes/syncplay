import React, {Component, useState, useEffect} from 'react'
import UserList from './UserList.js'

const ChatBox = props => {
    const msgEndRef = React.createRef();

    const scrollToBottom = () => {
        msgEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
      scrollToBottom();
    },[props.messages])

    return(
        <div className="chatContainer">
            <p className="error">{props.chatError}</p>
            <UserList connectedUsers={props.connectedUsers}/>
            <div className="messageBox">
                {props.messages.map((item,index) =>
                    item.sentFromHere ?
                    <div className="message messageFromHere" style={{"backgroundColor" : item.color}} key={index}>
                        <div className="messageContent">
                            <div className="messageHeader">
                                <p className="messageUser"><b>{item.user}</b></p>
                                <p className="messageTime"><b>{item.time}</b></p>
                            </div>
                            <p className="messageText">{item.text}</p>
                        </div>
                    </div>
                    :
                    <div className="message messageFromOther" style={{"backgroundColor" : item.color}} key={index}>
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
            <input id="chatInput" name="localMessage" onChange={props.handleChange} onKeyPress={props.sendMessage} value={props.localMessage}
            placeholder="Send a message to the room"/>
        </div>
    )
}


export default ChatBox
