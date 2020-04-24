import React, { Component} from 'react';
import './App.css';
import {Route,Switch} from 'react-router-dom';

import connect from './connect.js'
import socketClient from 'socket.io-client'

import Splash from './Splash.js'
import Room from './Room.js'

var key = connect.youtubeAPI.key

class App extends Component {


  constructor(props) {
    super(props)

    this.socket = socketClient('http://localhost:5001')

    this.state = {
      searchTerm : '',
      videoID : ''
    }
  }

  componentDidMount = () => {
    //check if youtube iframe API is loaded and if not, load it
    if(!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';

      //make youtube api script the first script tag
      const topScriptTag = document.getElementsByTagName('script')[0];
      topScriptTag.parentNode.insertBefore(tag, topScriptTag);
      

      //set callback for succesful load of API
      window.onYouTubeIframeAPIReady = this.youtubeAPILoaded;
    }
    else {
      this.youtubeAPILoaded();
    }

    /*--------------------- Sockets ------------------------*/

    //change video locally when another client changed the video
      this.socket.on("anotherClientChangedVideoId",(videoID) => {
        this.setState({videoID : videoID},() => {
          this.player.cueVideoById(this.state.videoID)
        })
      })

      //receive random room string from server and save locally,redirect to room
      this.socket.on("roomCreatedSuccesfully", (roomID) => {
        this.setState({roomID : roomID}, () => {
          window.location = '/room/' + roomID
        })
      })

      //pause/play video when another user pauses/plays
      this.socket.on("anotherUserPlayedVideo", () => {
        this.player.playVideo();
      })

      this.socket.on("anotherUserPausedVideo",() => {
        this.player.pauseVideo();
      })
    /*------------------------------------------------------*/
  }

  youtubeAPILoaded = () => {
    this.player = new window.YT.Player('player',{
      videoId : this.state.videoID,
      events : {
        onReady : this.onPlayerReady,
        onStateChange : this.onPlayerStateChange
      }
    });
  }

  onPlayerReady = event => {

  }

  onPlayerStateChange = (event) => {
    console.log("player state changed")

    //emit messages to pause/play other users on local pause/play
    console.log(window.YT.PlayerState)
    if(event.data == window.YT.PlayerState.PLAYING) {
      this.socket.emit("userPlayedVideo",this.state.roomID)
    }
    else if(event.data == window.YT.PlayerState.PAUSED) {
      this.socket.emit("userPausedVideo",this.state.roomID)
    }
  }

  handleChange = (event) => {
    this.setState({[event.target.name] : event.target.value})
  }

  searchForYoutubePreviews = () => {
    var url = 'https://www.googleapis.com/youtube/v3/search?q=test&key=' + key; 
    fetch(url,{

    })
    .then( res => res.json())
    .then(data => {
      console.log(data)
    })
  }

  searchInputEnterPressed = (event) => {
    if(event.which === 13) {
      //extract video ID from pasted URL
      const videoID = this.state.searchTerm.split("=")[1];
      this.setState({videoID : videoID},() => {
        this.player.cueVideoById(this.state.videoID)
        this.socket.emit('videoIdWasChangedByClient',this.state.videoID,this.state.roomID)
      })
    }
  }

  createNewRoom = (event) => {
    event.preventDefault();
    this.socket.emit("requestCreateNewRoom",this.socket.id)
  }

  setStateRoomCode = (roomID) => {
    this.setState({roomID : roomID},() => {
      this.socket.emit("userJoinedRoom",roomID)
    })
  }

  render = () => {
    return(
      <Switch>
          <Route exact path="/room/*" render={() => (
            <Room 
            handleChange={this.handleChange} 
            searchInputEnterPressed={this.searchInputEnterPressed} 
            videoSource={this.state.videoSource}
            setStateRoomCode={ (roomID) => {this.setStateRoomCode(roomID)}}
            />
          )} />
          <Route path="/" render={() => (
            <Splash createNewRoom={this.createNewRoom}/>
          )}/>
        </Switch>
    )
  }
}

export default App;
