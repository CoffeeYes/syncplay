import React, { Component } from 'react'
import socket from './Socket'

const Playlist = props => {

  const videoFromPlaylistWasClicked = (videoID,index) => {
    socket.emit("updatePlaylistIndex",index,sessionStorage.getItem("roomID"))
    //tell all users to play video from playlist
    socket.emit('videoIdWasChangedByClient',videoID,sessionStorage.getItem("roomID"),0)
  }
  return (
    <div className="playlistContainer">
      <div className="playlistHeader">
        <p>Playlist</p>
      </div>
      <div className="playlistVideosContainer">
        {props.playlistVideos.map( (item,index) =>
          <div className="playlistVideoContainer showPointerOnHover" key={index}>
            <div className="playlistVideoDataContainer"
            onClick={() => videoFromPlaylistWasClicked(item.videoID,index)}>
                <img className="playlistVideoImg" src={item.imgURL}/>
                <p className="playlistVideoTitle line-clamp-3">{item.title}</p>
            </div>
            <button
            className="removeFromPlaylistButton showPointerOnHover"
            onClick={() => props.removeVideoFromPlaylist(index)}>X</button>
          </div>
        )}
      </div>
    </div>
  )
}
export default Playlist
