import React, {Component} from 'react'

class ChatBox extends Component {
    render = () => {
        return(
            <div className="chatContainer">
                <div className="changeNameContainer">
                    <input id="changeUsernameInput" name="changeName" onChange={this.props.handleChange} placeholder="Change your Username..."/>
                    <button onClick={this.props.changeUsername} id="changeUsernameSubmit">Submit</button>
                </div>
                <div className="messageBox">
                    {this.props.messages.map((item,index) => {
                        return(
                            <div className="message" style={{"background-color" : item.color}}>
                                <div className="messageHeader">
                                    <p className="messageUser">{item.user}</p>
                                    <p className="messageTime">{item.time}</p>
                                </div>
                                <p className="messageText">{item.text}</p>
                            </div>
                        )
                    })}
                </div>
                <input id="chatInput" name="localMessage" onChange={this.props.handleChange} onKeyPress={this.props.sendMessage} value={this.props.localMessage}/>
            </div>
        )
    }
}
    

export default ChatBox