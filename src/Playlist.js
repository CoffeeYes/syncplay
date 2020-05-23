import React, { Component } from 'react'

class Playlist extends Component {
    render = () => {
        return (
            <div className="playlistContainer">
                <div className="playlistVideoContainer">
                    {this.props.playlistVideos.map( (item,index) => {
                        return (
                            <div className="playlistVideo" key={index} onClick={() => this.props.videoFromPlaylistWasClicked(item.videoID,index)}>
                                <img src={item.imgURL}/>
                                <p>{item.title}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

export default Playlist