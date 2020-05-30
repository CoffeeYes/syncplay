import React, { Component } from 'react'

class Playlist extends Component {
    render = () => {
        return (
            <div className="playlistContainer">
                <div className="playlistVideosContainer">
                    {this.props.playlistVideos.map( (item,index) => {
                        return (
                            <div className="playlistVideoContainer" key={index} onClick={() => this.props.videoFromPlaylistWasClicked(item.videoID,index)}>
                                <img className="playlistVideoImg" src={item.imgURL}/>
                                <p className="playlistVideoTitle line-clamp-3">{item.title}</p>
                                <button className="removeFromPlaylistButton" onClick={() => this.props.removeVideoFromPlaylist(index)}>X</button>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

export default Playlist