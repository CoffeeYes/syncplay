import React, { Component} from 'react';
import './App.css';

import SearchBar from './SearchBar.js'
import Player from './Player.js'

import connect from './connect.js'

var key = connect.youtubeAPI.key

class App extends Component {


  constructor(props) {
    super(props)

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
      const videoID = this.state.searchTerm.split("=")[1];
      this.setState({videoID : videoID},() => {
        this.player.loadVideoById(this.state.videoID)
      })
    }
  }
  render = () => {
    return(
      <div className="main">
        <SearchBar handleChange={this.handleChange} searchInputEnterPressed={this.searchInputEnterPressed}/>
        <Player videoSource={this.state.videoSource}/>
      </div>
      
    )
  }
}

export default App;
