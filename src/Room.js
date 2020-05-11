import React, {Component} from 'react';
import Player from './Player.js'
import SearchBar from './SearchBar.js'

import ChatBox from './ChatBox.js'

class Room extends Component {

    componentDidMount = () => {
        //re-hydrate room state after losing on redirect
        let roomID = window.location.href.split("/room/")[1]
        this.props.setStateRoomCode(roomID)
    }
    render = () => {
        return(
            <div className="main">
                <p className="error">{this.props.error}</p>
                <SearchBar handleChange={this.props.handleChange} searchInputEnterPressed={this.props.searchInputEnterPressed}/>
                <div className="playerAndChatContainer">
                    <Player videoSource={this.props.videoSource}/>
                    <ChatBox messages={this.props.messages} sendMessage={this.props.sendMessage} handleChange={this.props.handleChange}/>
                </div>
                
            </div>
        )
    }
}

export default Room