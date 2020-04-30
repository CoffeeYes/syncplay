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

class App extends Component {


  constructor(props) {
    super(props)

    this.socket = socketClient(connect.serverData.URL + ':5001')

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

      //receive video currentVideoID of room from backend
      this.socket.on("receiveCurrentVideoID",(videoID) => {
        this.setState({videoID : videoID});
      })

      this.socket.on("requestCurrentTimeStamp",() => {
        if(this.player.getPlayerState() != 2) {
          this.player.pauseVideo();
        }
        var time = Math.round(this.player.getCurrentTime());
        this.socket.emit("receiveCurrentTime",time,this.state.roomID);
      })

      this.socket.on("syncTimeWithNewUser", (time,videoID) => {
        //setState to time received so onReady function synchronizes player to this time
        this.setState({currentTime : time})
        this.player.pauseVideo();
      })

      //resync with another user if they changed time while paused
      this.socket.on("anotherUserChangedTimeWhilePaused", (time) => {
        if(this.player.PlayerState != 2) {
          this.player.pauseVideo();
        }

        this.player.seekTo(time,true);
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
    //load video and pause after 1 second to allow seeking for time sync from other users
    this.player.loadVideoById(this.state.videoID,0,"large")
    setTimeout(() => {
      this.player.pauseVideo();
      this.player.seekTo(this.state.currentTime,true);
    },1000)
    //request current video time
    this.socket.emit("newUserRequestTime",this.state.roomID);
  }

  onPlayerStateChange = (event) => {
    console.log("player state changed : " + event.data)

    //emit messages to pause/play other users on local pause/play
    console.log(window.YT.PlayerState)
    if(event.data == window.YT.PlayerState.PLAYING) {
      this.socket.emit("userPlayedVideo",this.state.roomID)
      //clear intervall for time changes when player is paused
      clearInterval(checkTimeWhilePaused)

      var timeCounter = Math.round(this.player.getCurrentTime());
      timeTracker = setInterval(() => {
        timeCounter += 1;
        var currentTime = Math.round(this.player.getCurrentTime());

        console.log("current Time : " + currentTime)
        console.log("current count " + timeCounter)

        if(currentTime != timeCounter) {
          //allow for one second variation and adjust timer
          if(currentTime - 1 != timeCounter || currentTime +1 != timeCounter) {
            timeCounter = currentTime;
            console.log("Error with Local Time Sync")
            console.log("current Time(error) : " + currentTime)
            console.log("current count(error) " + timeCounter)
          }
          else {
            //pause the player when time changes so that the player re-synchronizes the other users
            this.player.pauseVideo();
          }
        }
      },1000)
    }
    else if(event.data == window.YT.PlayerState.PAUSED) {
      //clear interval that checks for time changes when player is playing
      clearInterval(timeTracker);
      //tell other users to pause
      this.socket.emit("userPausedVideo",this.state.roomID)

      var timePausedAt = Math.round(this.player.getCurrentTime());

      this.socket.emit("resyncTimeOnPause",timePausedAt,this.state.roomID)

      checkTimeWhilePaused = setInterval( () => {
        var currentTime = Math.round(this.player.getCurrentTime());
        //check if a user changes timestamp while the video is paused, emit to backend to resync other users if time was changed

        if( currentTime != timePausedAt) {
          timePausedAt = currentTime
          this.socket.emit("userChangedTimeWhilePaused",currentTime,this.state.roomID);
        }
      },1000)
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
        this.player.loadVideoById(this.state.videoID,0,"large")
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
