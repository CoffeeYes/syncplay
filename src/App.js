import React, { Component} from 'react';
import './App.css';
import {Route,Switch} from 'react-router-dom';

import connect from './connect.js'
import socketClient from 'socket.io-client'

import SearchBar from './SearchBar.js'
import Player from './Player.js'
import Splash from './Splash.js'

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
    /*------------------------------------------------------*/
  }

  youtubeAPILoaded = () => {
    this.player = new window.YT.Player('player',{
      videoId : this.state.videoID,
      events : {
        onReady : this.onPlayerReady
      }
    });
  }

  onPlayerReady = event => {

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
        this.socket.emit('videoIdWasChangedByClient',this.state.videoID)
      })
    }
  }
  render = () => {
    return(
      <Switch>
          <Route exact path="/room/" render={() => (
            <div className="main">
              <SearchBar handleChange={this.handleChange} searchInputEnterPressed={this.searchInputEnterPressed}/>
              <Player videoSource={this.state.videoSource}/>
            </div>
          )} />
          <Route path="/" render={() => (
            <Splash />
          )}/>
        </Switch>
      
      
    )
  }
}

export default App;
