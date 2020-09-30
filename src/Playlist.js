import React, { Component } from 'react'
import socket from './Socket'
import { Paper, Button } from '@material-ui/core'

const Playlist = props => {

  const videoFromPlaylistWasClicked = (videoID,index) => {
    socket.emit("updatePlaylistIndex",index,sessionStorage.getItem("roomID"))
    //tell all users to play video from playlist
    socket.emit('videoIdWasChangedByClient',videoID,sessionStorage.getItem("roomID"),0)
  }

  const removeVideoFromPlaylist = index => {
    socket.emit("userRemovedVideoFromPlaylist",index,sessionStorage.getItem("roomID"))
  }
  return (
    <Paper elevation={2} className="playlistContainer">
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
            <Button
            variant="contained"
            color="primary"
            className="removeFromPlaylistButton showPointerOnHover"
            onClick={() => removeVideoFromPlaylist(index)}>X</Button>
          </div>
        )}
      </div>
    </Paper>
  )
}
export default Playlist
