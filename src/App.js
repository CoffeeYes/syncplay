import React, { Component} from 'react';
import './App.css';
import {Route,Switch} from 'react-router-dom';

import connect from './connect.js'
import socketClient from 'socket.io-client'

import Splash from './Splash.js'
import Room from './Room.js'

var key = connect.youtubeAPI.key

var checkTimeWhilePaused;
var timeTracker;

var timePausedAt

class App extends Component {


  constructor(props) {
    super(props)
    console.log(connect.serverData.url)
    this.socket = socketClient(connect.serverData.url + ':5001')

    this.state = {
      searchTerm : '',
      videoID : '',
      currentTime : 0
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
      this.socket.on("anotherClientChangedVideoId",(videoID,time) => {
        this.setState({videoID : videoID},() => {
          this.player.loadVideoById(this.state.videoID,time)
          this.player.playVideo();
          setTimeout( () => {
            this.player.pauseVideo();
          },1000)
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

      this.socket.on("anotherUserPausedVideo",(time) => {
        this.player.seekTo(time,true);
        this.player.pauseVideo();
      })

      //receive video currentVideoID of room from backend
      this.socket.on("receiveCurrentVideoID",(videoID) => {
        this.setState({videoID : videoID});
      })

      this.socket.on("requestCurrentTimeStamp",(newClientID) => {
        var time = Math.round(this.player.getCurrentTime());
        this.socket.emit("receiveCurrentTime",time,this.state.roomID,newClientID);
      })

      //resync with another user if they changed time while paused
      this.socket.on("anotherUserChangedTimeWhilePaused", (time) => {
        this.player.seekTo(time,true);
        this.player.pauseVideo()
      })

      this.socket.on("newUserReceiveVideoAndTimeStamp", (time,videoID) => {
        this.player.cueVideoById(videoID,time,"large"); 
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
    //emit ready event to receive id and timestamp from backend
    this.socket.emit("newUserRequestVideoIdAndTimeStamp",this.state.roomID);
  }

  onPlayerStateChange = (event) => {
    console.log("player state changed : " + event.data)

    //emit messages to pause/play other users on local pause/play
    console.log(window.YT.PlayerState)
    if(event.data == window.YT.PlayerState.PLAYING) {
      //clear paused timechange checker
      clearInterval(checkTimeWhilePaused)
      //tell other users to play video
      this.socket.emit("userPlayedVideo",this.state.roomID)
      
    }
    else if(event.data == window.YT.PlayerState.PAUSED) {
      //clear old timechecker incase of re-pause
      clearInterval(checkTimeWhilePaused)
      //tell other users time is paused
      this.socket.emit("userPausedVideo",this.player.getCurrentTime(),this.state.roomID)

      var timePausedAt = this.player.getCurrentTime()
      var currentTimeWhilePaused = this.player.getCurrentTime()
      checkTimeWhilePaused = setInterval(() => {
        if(currentTimeWhilePaused != timePausedAt) {
          this.socket.emit("userChangedTimeWhilePaused",currentTimeWhilePaused,this.state.roomID);
          timePausedAt = currentTimeWhilePaused
        }
        currentTimeWhilePaused = this.player.getCurrentTime();
      },1000)
    }
  }

  handleChange = (event) => {
    this.setState({[event.target.name] : event.target.value})
  }

  searchInputEnterPressed = (event) => {
    if(event.which === 13) {

      var videoID;
      var time = 0;

      //extract video ID from pasted URL
      if(this.state.searchTerm.includes(".be")) {
        //if video is "be" format and contains timestamp do seperate split
        videoID = this.state.searchTerm.split("youtu.be/")[1];
        if(videoID.includes("?")) {
          time = videoID.split("?t=")[1];
          videoID = videoID.split("?")[0];
        }
      }
      //normal string split to get videoID
      else {
        videoID = this.state.searchTerm.split("=")[1];
      }
      this.setState({videoID : videoID},() => {
        this.player.loadVideoById(this.state.videoID,time,"large")
        this.socket.emit('videoIdWasChangedByClient',this.state.videoID,this.state.roomID,time)
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
