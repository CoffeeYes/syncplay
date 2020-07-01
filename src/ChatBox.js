import React, {Component} from 'react'
import UserList from './UserList.js'

class ChatBox extends Component {
    constructor(props) {
        super(props)

        this.msgEndRef = React.createRef();
    }

    componentDidUpdate = () => {
        this.scrollToBottom();
        console.log("update")
    }

    scrollToBottom = () => {
        this.msgEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    
    render = () => {
        return(
            <div className="chatContainer">
                <p className="error">{this.props.chatError}</p>
                <UserList connectedUsers={this.props.connectedUsers}/>
                <div className="messageBox" ref={this.msgBoxRef}>
                    {this.props.messages.map((item,index) => {
                        return(
                            <div className="message" style={{"backgroundColor" : item.color}} key={index}>
                                <div className="messageContent">
                                    <div className="messageHeader">
                                        <p className="messageUser"><b>{item.user}</b></p>
                                        <p className="messageTime"><b>{item.time}</b></p>
                                    </div>
                                    <p className="messageText">{item.text}</p>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={this.msgEndRef}/>
                </div>
                <input id="chatInput" name="localMessage" onChange={this.props.handleChange} onKeyPress={this.props.sendMessage} value={this.props.localMessage}
                placeholder="Send a message to the room"/>
            </div>
        )
    }
}
    

export default ChatBox