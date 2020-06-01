import React, {Component} from 'react';
import Player from './Player.js'
import SearchBar from './SearchBar.js'

import ChatBox from './ChatBox.js'
import Playlist from './Playlist'

class Room extends Component {

    componentDidMount = () => {
        //re-hydrate room state after losing on redirect
        let roomID = window.location.href.split("/room/")[1]
        this.props.setStateRoomCode(roomID)
    }
    render = () => {
        return(
            <div className="main">
                <SearchBar 
                handleChange={this.props.handleChange} 
                searchInputEnterPressed={this.props.searchInputEnterPressed} 
                searchResults={this.props.searchResults}
                searchTerm={this.props.searchTerm}
                userClickedSearchResult={(videoID) => this.props.userClickedSearchResult(videoID)}
                addVideoToPlaylist={(videoObj => this.props.addVideoToPlaylist(videoObj))}
                error={this.props.error}
                />
                <Player videoSource={this.props.videoSource}/>
                <Playlist
                playlistVideos={this.props.playlistVideos}
                videoFromPlaylistWasClicked={(videoID, index) => this.props.videoFromPlaylistWasClicked(videoID, index)}
                removeVideoFromPlaylist={(index) => this.props.removeVideoFromPlaylist(index)}
                />
                <ChatBox
                localMessage={this.props.localMessage}
                messages={this.props.messages}
                sendMessage={this.props.sendMessage}
                handleChange={this.props.handleChange}
                changeName={this.props.changeName}
                changeUsername={this.props.changeUsername}
                chatError={this.props.chatError}
                />
                
            </div>
        )
    }
}

export default Room