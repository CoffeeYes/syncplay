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

var timePausedAt;

class App extends Component {


  constructor(props) {
    super(props)
    console.log(connect.serverData.url)
    this.socket = socketClient(connect.serverData.url + ':5001')

    this.state = {
      searchTerm : '',
      videoID : '',
      currentTime : 0,
      error : "",
      chatError : "",
      allowPlay : true,
      localMessage : "",
      messages : [],
      changeName : "",
      searchResults : [],
      playlistVideos : [],
      playlistCurrentVideoIndex : -1,
      currentPlayerState : "",
      connectedUsers : ["user1","user2"]
    }
  }

  searchForVideoByString = () => {
    //allow clearing of search results by entering nothing
    if(this.state.searchTerm == "") {
      return this.setState({searchResults : []})
    }

    fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&videoSyndicated=true&type=video&q=" + this.state.searchTerm + "&maxResults=5&key=" + connect.youtubeAPI.key )
    .then(res => res.json())
    .then(data => {
      this.setState({searchResults : data.items})
    })
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

    //check if user doesnt have window open/visible
    var prevhidden = false;
    setInterval( () => {
      if(document.hidden && prevhidden == false) {
        console.log("minimized")
        this.socket.emit("userMinimizedWindow",this.state.roomID)
        this.player.pauseVideo()
        prevhidden = true;
      }
      else if(prevhidden == true && !document.hidden) {
        prevhidden = false;
        this.socket.emit("userMaximizedWindow",this.state.roomID)
      }
    },1000)
    /*--------------------- Sockets ------------------------*/

    //receive errors from backend
    this.socket.on("clientError",(message) => {
      this.setState({error : message})
    })

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
        this.player.pauseVideo();
      })

      this.socket.on("newUserReceiveVideoAndTimeStamp", (time,videoID) => {
        this.player.loadVideoById(videoID,time,"large");
        this.socket.emit("newUserLoadedVideo",this.state.roomID)
      })

      this.socket.on("newUserJoinedRoom", (newUserID) => {
        console.log("playerstate : " + this.player.getPlayerState())
        //video is playing
        if(this.player.getPlayerState() == 1) {
          this.player.pauseVideo()
        }
        else {
          this.socket.emit("newUserMustPause",newUserID)
        }
      })

      this.socket.on("newUserMustPause",() => {
        this.player.pauseVideo()
      })

      this.socket.on("disallowPlaying",() => {
        this.setState({allowPlay : false})
      })

      this.socket.on("allowPlaying",() => {
        this.setState({allowPlay: true})
      })

      this.socket.on("receiveNewMessage",(message) => {
        this.setState((prevState) => ({messages : [...prevState.messages,message]}))
      })

      this.socket.on("chatError", (error) => {
        this.setState({chatError : error})
      })

      this.socket.on("anotherUserAddedVideoToPlaylist",(videoData) => {
        this.setState( (prevState) => ({playlistVideos : [...prevState.playlistVideos,videoData]}))
      })

      this.socket.on("hydratePlaylistState", (playlist,index) => {
        this.setState({
          playlistVideos : playlist,
          playlistCurrentVideoIndex : index
        });
      })

      this.socket.on("videoIndexWasUpdated", (index) => {
        this.setState({playlistCurrentVideoIndex: index})
      })

      this.socket.on("anotherUserRemovedVideoFromPlaylist", (index) => {
        this.setState({playlistVideos : this.state.playlistVideos.filter( (item) => {
          if(this.state.playlistVideos.indexOf(item) !== index) {
            return item;
          }
        })})
      })

      this.socket.on("receiveConnectedUsers", (connectedUsers) => {
        this.setState({connectedUsers : connectedUsers})
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
      this.setState({currentPlayerState : "playing"});
      //pause video if playing is not allowed
      if(this.state.allowPlay == false) {
        this.player.pauseVideo();
      }
      //clear paused timechange checker
      clearInterval(checkTimeWhilePaused)
      //tell other users to play video
      this.socket.emit("userPlayedVideo",this.state.roomID)
      
    }
    else if(event.data == window.YT.PlayerState.PAUSED) {
      this.setState({currentPlayerState : "paused"});
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
      },100)
    }
    else if(event.data == window.YT.PlayerState.ENDED) {
      this.setState({currentPlayerState : "ended"})
      //if there are videos in the playlist and were not at the last video of the playlist play the next one
      if(this.state.playlistVideos != "" && this.state.playlistCurrentVideoIndex +1 <= this.state.playlistVideos.length -1) {
        //increment playlist video index and then play the video
        this.setState({playlistCurrentVideoIndex : this.state.playlistCurrentVideoIndex + 1},() => {
          this.socket.emit("updatePlaylistIndex",this.state.playlistCurrentVideoIndex,this.state.roomID)
          this.socket.emit("videoIdWasChangedByClient",this.state.playlistVideos[this.state.playlistCurrentVideoIndex].videoID,this.state.roomID,0);
        })
      }
    }
  }

  handleChange = (event) => {
    this.setState({[event.target.name] : event.target.value})
  }

  searchInputEnterPressed = (event) => {
    if(event.which === 13) {
      var ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
      //check if typed text is a youtube link, if not perform a search 
      if(ytRegex.test(this.state.searchTerm) == false) {
        return this.searchForVideoByString()
      }
      //url parameter object to extract information from
      const URLParams = new URLSearchParams(this.state.searchTerm)

      var videoID = "";
      var time = 0;

      //if time parameter is present set this as video time
      if(URLParams.has('t')) {
        time = URLParams.get('t')
      }

      //if URL is standard youtube URL extract video ID from param
      if(URLParams.has('https://www.youtube.com/watch?v')) {
        videoID = URLParams.get('https://www.youtube.com/watch?v')
      }

      //if url is non-standard .be URL extract video ID and time from pasted URL
      if(this.state.searchTerm.includes(".be") && URLParams.get('feature') != "youtu.be") {
        //if video is "be" format and contains timestamp do seperate split
        videoID = this.state.searchTerm.split("youtu.be/")[1];
        if(videoID.includes("?")) {
          time = videoID.split("?t=")[1];
          videoID = videoID.split("?")[0];
        }
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

  sendMessage = (event) => {
    if(event.which == 13) {
      console.log(this.state.localMessage)

      this.socket.emit("newMessage",this.state.localMessage,this.state.roomID)
      this.setState({localMessage : ""})
    }
  }

  changeUsername = (event) => {
    //reset chat error
    this.setState({chatError : ""})
    //empty check
    if(this.state.changeName == "") {
      return this.setState({chatError : "Username cannot be empty"})
    }
    this.socket.emit("clientChangedUsername",this.state.changeName,this.state.roomID)
    this.setState({changeName : ""})
  }

  userClickedSearchResult = (videoID) => {
    this.setState({videoID : videoID},() => {
      //cue video and emit ID to other users
      this.player.loadVideoById(this.state.videoID,0,"large")
      this.socket.emit('videoIdWasChangedByClient',this.state.videoID,this.state.roomID,0)
      //clear search results and search term
      this.setState({searchResults : [],searchTerm : ""})
    })
  }

  addVideoToPlaylist = (videoObj) => {
    console.log(videoObj)

    var videoData = {
      title : videoObj.snippet.title,
      videoID : videoObj.id.videoId,
      imgURL : videoObj.snippet.thumbnails.default.url
    }

    this.setState(this.setState((prevState) => ({playlistVideos : [...prevState.playlistVideos,videoData]})))
    this.socket.emit("userAddedVideoToPlaylist",videoData,this.state.roomID)
  }

  videoFromPlaylistWasClicked = (videoID,index) => {
    //update current playlist index locally and on backend
    this.setState({playlistCurrentVideoIndex : index})
    this.socket.emit("updatePlaylistIndex",index,this.state.roomID)

    //tell all users to play video from playlist
    this.socket.emit('videoIdWasChangedByClient',videoID,this.state.roomID,0)
    
  }

  removeVideoFromPlaylist = (index) => {
    this.setState({playlistVideos : this.state.playlistVideos.filter( (item) => {
      if(this.state.playlistVideos.indexOf(item) !== index) {
        return item;
      }
    })})
    this.socket.emit("userRemovedVideoFromPlaylist",index,this.state.roomID)
  }

  render = () => {
    return(
      <Switch>
          <Route exact path="/room/*" render={() => (
            <Room
            error={this.state.error}
            handleChange={this.handleChange}
            searchInputEnterPressed={this.searchInputEnterPressed}
            videoSource={this.state.videoSource}
            setStateRoomCode={ (roomID) => {this.setStateRoomCode(roomID)}}
            localMessage={this.state.localMessage}
            messages={this.state.messages}
            sendMessage={this.sendMessage}
            changeName={this.state.changeName}
            changeUsername={this.changeUsername}
            chatError={this.state.chatError}
            searchResults={this.state.searchResults}
            searchTerm={this.state.searchTerm}
            userClickedSearchResult={(videoID) => this.userClickedSearchResult(videoID)}
            playlistVideos={this.state.playlistVideos}
            addVideoToPlaylist={(videoObj => this.addVideoToPlaylist(videoObj))}
            videoFromPlaylistWasClicked={(videoID,index) => this.videoFromPlaylistWasClicked(videoID,index)}
            removeVideoFromPlaylist={ (index) => this.removeVideoFromPlaylist(index)}
            connectedUsers={this.state.connectedUsers}
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
