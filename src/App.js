import React, { Component} from 'react';
import './App.css';
import {Route,Switch} from 'react-router-dom';
import reactGA from './ReactGA'

import connect from './connect.js'

import Splash from './Splash.js'
import Room from './Room.js'

import socket from './Socket'

var key = connect.youtubeAPI.key

var checkTimeWhilePaused;
var timeTracker;
var checkMinimize;

var timePausedAt;

class App extends Component {


  constructor(props) {
    super(props)
    this.socket = socket

    this.state = {
      socketID : "",
      searchTerm : '',
      videoID : '',
      currentTime : 0,
      error : "",
      chatError : "",
      allowPlay : true,
      messages : [],
      changeName : sessionStorage.getItem("username") || "",
      searchResults : [],
      playlistVideos : [],
      playlistCurrentVideoIndex : -1,
      currentPlayerState : "",
      chooseUsername : "",
      showUsernameModal : true,
      showAddToPlaylistFromURLButton : false,
      nameError : "",
      blockMinimize : true,
      autoPlay : false
    }
  }

  searchForVideoByString = () => {
    //allow clearing of search results by entering nothing
    if(this.state.searchTerm == "") {
      return this.setState({searchResults : []})
    }

    fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&videoSyndicated=true&type=video&q="
    + this.state.searchTerm + "&maxResults=5&key=" + key +
    "&origin=https://www.youtubeparty.net"
    )
    .then(res => res.json())
    .then(data => {
      this.setState({searchResults : data.items})
    })
  }
  componentDidMount = () => {
    //google analytics
    reactGA.pageview('/')
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
    //get backend socket identifier to determine whether messages are of local or remote origin
    this.socket.emit("clientGetSocketID");
    this.socket.on("clientReceiveSocketID",(clientID) => {
      this.setState({socketID : clientID});
    })

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
          reactGA.pageview('/room/')
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
        //this.player.pauseVideo();
        //block playing while waiting to receive all user synced signal, emit own sync signal
        this.setState({"allowPlay" : false,"error" : "Waiting for users to synchronise"},() => {
          this.socket.emit("synchronizedTimeChange",this.state.roomID)
        })
      })

      this.socket.on("newUserReceiveVideoAndTimeStamp", (time,videoID) => {
        //check for player to be loaded, once it is loaded and playin pause playback
        this.player.loadVideoById(videoID,time,"large")
        var loadedCheck = setInterval(() => {
          if(this.player.getPlayerState() != undefined && this.player.getPlayerState() == window.YT.PlayerState.PLAYING) {
              this.socket.emit("newUserLoadedVideo",this.state.roomID)
              clearInterval(loadedCheck)
          }
        },100)

      })

      //pause decision when a new user joins, either room head pauses or joining user must pause
      this.socket.on("newUserJoinedRoom", (newUserID) => {
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
        //get local client timestamp and add it to message
        var currentDate = new Date(Date.now())
        var hours = currentDate.getHours()
        var minutes = currentDate.getMinutes()

        //format time to 24-hour format
        if(minutes < 10) {
            minutes = "0" + minutes
        }

        if(hours < 10) {
            hours = "0" + hours
        }
        message.time = hours + ":" + minutes

        //identify if message origin is this client(for conditional message styling), then delete the messageSenders socketID
        if(message.messageSender == this.state.socketID) {
          message.sentFromHere = true
        }
        else {
          message.sentFromHere = false
        }
        delete message.messageSender;

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

      this.socket.on("kickUser",()=> {
        window.location.href = "/"
      })

      //continuation from changeName function, server response to check if username was already taken
      this.socket.on("clientChangeNameReturn",confirmation => {
        //display backend error
        if(confirmation.error && !confirmation.success) {
          this.setState({nameError : confirmation.error})
        }
        //no errors with username choice
        else if (confirmation.success) {
          this.setState({
            nameError : "",
            changeName : "",
            showUsernameModal: false
          })
          //save username for reloads and other sessions
          sessionStorage.setItem("username",confirmation.name)
        }
      })

      this.socket.on("anotherUserChangedBlockMinimize", (blockState) => {
        this.setState({blockMinimize : blockState})
        this.setState({error : "",allowPlay : true})
        if(blockState) {
          //check if user is currently minimized when another user turns on minimize block
          var prevhidden;
          if(document.hidden) {
            prevhidden = true;
            this.socket.emit("userMinimizedWindow",this.state.roomID)
            this.player.pauseVideo()
          }
          else {
            prevhidden = false
          }
          //interval to check if a user minimizes
          checkMinimize = setInterval( () => {
            if(document.hidden && !prevhidden) {
              this.socket.emit("userMinimizedWindow",this.state.roomID)
              this.player.pauseVideo()
              prevhidden = true;
            }
            else if(prevhidden && !document.hidden) {
              prevhidden = false;
              this.socket.emit("userMaximizedWindow",this.state.roomID)
            }
          },1000)
        }
        else {
          clearInterval(checkMinimize)
        }
      })
      //get block state of room, setup interval check for minimize if blockstate is true
      this.socket.on("receiveCurrentBlockState",(blockState) => {
        this.setState({blockMinimize : blockState},() => {
          if(this.state.blockMinimize) {
            //check if user doesnt have window open/visible
            var prevhidden = false;
            checkMinimize = setInterval( () => {
              if(document.hidden && prevhidden == false) {
                this.socket.emit("userMinimizedWindow",this.state.roomID)
                this.player.pauseVideo()
                prevhidden = true;
              }
              else if(prevhidden == true && !document.hidden) {
                prevhidden = false;
                this.socket.emit("userMaximizedWindow",this.state.roomID)
              }
            },1000)
          }
        })
      })
      this.socket.on("anotherUserChangedAutoPlay",(autoPlayState) => {
        this.setState({autoPlay : autoPlayState})
      })
    /*------------------------------------------------------*/
  }

  youtubeAPILoaded = () => {
    this.player = new window.YT.Player('player',{
      videoId : this.state.videoID,
      events : {
        onReady : this.onPlayerReady,
        onStateChange : this.onPlayerStateChange
      },
      playerVars : {
        origin : "http://www.youtube.com"
      }
    });
  }

  onPlayerReady = event => {
    //emit ready event to receive id and timestamp from backend
    this.socket.emit("newUserRequestVideoIdAndTimeStamp",this.state.roomID);
  }

  onPlayerStateChange = (event) => {

    //emit messages to pause/play other users on local pause/play
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
      //monitor players timestamp to detect changes
      var timePausedAt = this.player.getCurrentTime()
      var currentTimeWhilePaused = this.player.getCurrentTime()
      checkTimeWhilePaused = setInterval(() => {
        if(currentTimeWhilePaused != timePausedAt) {
          if(this.state.allowPlay) {
            this.socket.emit("userChangedTimeWhilePaused",currentTimeWhilePaused,this.state.roomID);
            timePausedAt = currentTimeWhilePaused
          }
          else {
            //if playing is blocked reset the time change
            this.player.seekTo(timePausedAt,true)
          }
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
          //autoplay video if user has toggled autoplay on
          if(this.state.autoPlay) {
            var autoplayCheck = setInterval(() => {
              if(this.player.getPlayerState() == window.YT.PlayerState.PAUSED) {
                this.player.playVideo();
                clearInterval(autoplayCheck);
              }
            },100)
          }
        })
      }
    }
  }

  handleChange = (event) => {
    this.setState({[event.target.name] : event.target.value},() => {
      //clear searchresults if user deleted searchterm
      if(this.state.searchTerm == "") {
        this.setState({searchResults : []})
      }
      else {
        //check if user pasted in a youtube video URL, if so show the "add to playlist from url" button
        var ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
        if(ytRegex.test(this.state.searchTerm) == true) {
          return this.setState({showAddToPlaylistFromURLButton : true,searchResults : []})
        }
      }
      //if return wasnt fired hide the add to playlist from url button
      this.setState({showAddToPlaylistFromURLButton : false})
    })
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
        this.setState({searchTerm : "",showAddToPlaylistFromURLButton : false})
      })
    }
  }

  initializeRoom = (roomID) => {
    sessionStorage.setItem("roomID",roomID);
    this.setState({roomID : roomID},() => {
      this.socket.emit("userJoinedRoom",roomID)
      //check if the joining user already had a username (reloaded the page) and update it on the backend
      if(this.state.changeName != "") {
        this.setState({showUsernameModal : false})
        this.socket.emit("clientChangedUsername",this.state.changeName,this.state.roomID)
        this.setState({changeName : ""})
      }
    })
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

  addToPlaylistFromURL = () => {
    //url parameter object to extract information from
    const URLParams = new URLSearchParams(this.state.searchTerm)

    //if pasted link is a playlist, add first 20 items from youtube playlist to youtubeparty playlist and return out of addToPlaylistFromURL
    var playlistID = ""
    if(URLParams.has("list")) {
      playlistID = URLParams.get("list");
      fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId="
       + playlistID + "&key=" + key + "&origin=https://www.youtubeparty.net")
      .then(res => res.json())
      .then(data => {
        for(var item in data.items) {
          var videoData = {
            title : data.items[item].snippet.title,
            videoID : data.items[item].snippet.resourceId.videoId,
            imgURL : data.items[item].snippet.thumbnails.default.url
          }
          this.setState(this.setState((prevState) => ({playlistVideos : [...prevState.playlistVideos,videoData]})))
          this.socket.emit("userAddedVideoToPlaylist",videoData,this.state.roomID)
        }

      })
      return this.setState({searchTerm : "",showAddToPlaylistFromURLButton : false});
    }

    var videoID = "";

    //if URL is standard youtube URL extract video ID from param
    if(URLParams.has('https://www.youtube.com/watch?v')) {
      videoID = URLParams.get('https://www.youtube.com/watch?v')
    }
    //if url is non-standard .be URL extract video ID and time from pasted URL
    if(this.state.searchTerm.includes(".be") && URLParams.get('feature') != "youtu.be") {
      videoID = this.state.searchTerm.split("youtu.be/")[1];
    }

    //fetch image and title from videoID and add to playlist
    fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" +
    videoID + "&key=" + key + "&origin=https://www.youtubeparty.net" )
    .then(res => res.json())
    .then(data => {
      var videoData = {
      title : data.items[0].snippet.title,
      videoID : data.items[0].id,
      imgURL : data.items[0].snippet.thumbnails.default.url
      }
      this.setState(this.setState((prevState) => ({playlistVideos : [...prevState.playlistVideos,videoData]})))
      this.setState({searchTerm : "",showAddToPlaylistFromURLButton : false})
    })
  }

  hideSearchOnExit = (event) => {
    const target = event.currentTarget

    setTimeout(() => {
      if (!target.contains(document.activeElement)) {
        this.setState({searchResults : [],searchTerm : ""})
      }
    },100)
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
            initializeRoom={ (roomID) => {this.initializeRoom(roomID)}}
            messages={this.state.messages}
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
            showUsernameModal={this.state.showUsernameModal}
            nameError={this.state.nameError}
            showAddToPlaylistFromURLButton={this.state.showAddToPlaylistFromURLButton}
            addToPlaylistFromURL={this.addToPlaylistFromURL}
            blockMinimize={this.state.blockMinimize}
            autoPlay={this.state.autoPlay}
            hideSearchOnExit={this.hideSearchOnExit}
            />
          )}/>
          <Route path="/" render={() => (
            <Splash createNewRoom={this.createNewRoom}/>
          )}/>
        </Switch>
    )
  }
}

export default App;
