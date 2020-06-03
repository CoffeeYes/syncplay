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
                <div className="changeNameContainer">
                    <input id="changeUsernameInput" name="changeName" onChange={this.props.handleChange} placeholder="Change your Username..." value={this.props.changeName}/>
                    <button onClick={this.props.changeUsername} id="changeUsernameSubmit">Submit</button>
                </div>
                <UserList connectedUsers={this.props.connectedUsers}/>
                <div className="messageBox" ref={this.msgBoxRef}>
                    {this.props.messages.map((item,index) => {
                        return(
                            <div className="message" style={{"background-color" : item.color}}>
                                <div className="messageContent">
                                    <div className="messageHeader">
                                        <p className="messageUser">{item.user}</p>
                                        <p className="messageTime">{item.time}</p>
                                    </div>
                                    <p className="messageText">{item.text}</p>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={this.msgEndRef}/>
                </div>
                <input id="chatInput" name="localMessage" onChange={this.props.handleChange} onKeyPress={this.props.sendMessage} value={this.props.localMessage}/>
            </div>
        )
    }
}
    

export default ChatBox