import React, {Component} from 'react';
import Player from './Player.js'
import SearchBar from './SearchBar.js'

class Room extends Component {

    componentDidMount = () => {
        let roomID = window.location.href.split("/room/")[1]
        this.props.setStateRoomCode(roomID)
    }
    render = () => {
        return(
            <div className="main">
                <SearchBar handleChange={this.props.handleChange} searchInputEnterPressed={this.props.searchInputEnterPressed}/>
                <Player videoSource={this.props.videoSource}/>
            </div>
        )
    }
}

export default Room