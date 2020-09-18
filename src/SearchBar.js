import React,{ Component, useEffect, useState } from 'react';
import SearchResult from './SearchResult'
import ToggleOptions from './ToggleOptions'
import { Button } from '@material-ui/core'

import Logo from './assets/Logo.png';
import GA from './ReactGA';
import connect from './connect'
import socket from './Socket'

const key = connect.youtubeAPI.key

const SearchBar = props => {
    const { setShowPlaylistAndChat,
            showPlaylistAndChat,
            setPlayerClass,
            playerClass } = props;

    const [linkCopied, setLinkCopied] = useState(false);
    const [searchTerm,setSearchTerm] = useState("");
    const [searchResults,setSearchResults] = useState([]);
    const [showAddToPlaylistFromURLButton,setShowAddToPlaylistFromURLButton] =
      useState(false);

      const handleSearchChange = event => {
        setSearchTerm(event.target.value);

        if(event.target.value === "") {
          setSearchResults([]);
          setShowAddToPlaylistFromURLButton(false);
        }
        var ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
        if(ytRegex.test(event.target.value) == true) {
          setShowAddToPlaylistFromURLButton(true);
        }
      }

    const copyLink = () => {
        var link = window.location.href;
        navigator.clipboard.writeText(link);
        setLinkCopied(true)

        setTimeout(() => {
          setLinkCopied(false)
        },400)
    }

    const hideSearchOnExit = event => {
      const target = event.currentTarget

      setTimeout(() => {
        if (!target.contains(document.activeElement)) {
          setSearchResults([]);
          setSearchTerm("");
          setShowAddToPlaylistFromURLButton(false)
        }
      },100)
    }

    const searchForVideoByString = () => {
      //allow clearing of search results by entering nothing
      if(searchTerm == "") {
        return setSearchResults([])
      }

      fetch("https://www.googleapis.com/youtube/v3/search?part=snippet&videoSyndicated=true&type=video&q="
      + searchTerm + "&maxResults=5&key=" + key
      )
      .then(res => res.json())
      .then(data => {
        setSearchResults(data.items)
      })
    }

    const searchInputEnterPressed = event => {
      if(event.which === 13) {
        var ytRegex = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
        //check if typed text is a youtube link, if not perform a search
        if(ytRegex.test(searchTerm) == false) {
          return searchForVideoByString()
        }
        //url parameter object to extract information from
        const URLParams = new URLSearchParams(searchTerm)

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
        if(searchTerm.includes(".be") && URLParams.get('feature') != "youtu.be") {
          //if video is "be" format and contains timestamp do seperate split
          videoID = searchTerm.split("youtu.be/")[1];
          if(videoID.includes("?")) {
            time = videoID.split("?t=")[1];
            videoID = videoID.split("?")[0];
          }
        }
        // this.player.loadVideoById(this.state.videoID,time,"large");
        socket.emit('videoIdWasChangedByClient',videoID,sessionStorage.getItem("roomID"),time);
        setSearchTerm("");
        // this.setState({searchTerm : "",showAddToPlaylistFromURLButton : false})
      }
    }

    const addToPlaylistFromURL = () => {
      //url parameter object to extract information from
      const URLParams = new URLSearchParams(searchTerm)

      //if pasted link is a playlist, add first 20 items from youtube playlist to youtubeparty playlist and return out of addToPlaylistFromURL
      var playlistID = ""
      if(URLParams.has("list")) {
        playlistID = URLParams.get("list");
        fetch("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=20&playlistId="
         + playlistID + "&key=" + key)
        .then(res => res.json())
        .then(data => {
          for(var item in data.items) {
            var videoData = {
              title : data.items[item].snippet.title,
              videoID : data.items[item].snippet.resourceId.videoId,
              imgURL : data.items[item].snippet.thumbnails.default.url
            }
            socket.emit("userAddedVideoToPlaylist",videoData,sessionStorage.getItem("roomID"))
          }
        })
      }

      var videoID = "";

      //if URL is standard youtube URL extract video ID from param
      if(URLParams.has('https://www.youtube.com/watch?v')) {
        videoID = URLParams.get('https://www.youtube.com/watch?v')
      }
      //if url is non-standard .be URL extract video ID and time from pasted URL
      if(searchTerm.includes(".be") && URLParams.get('feature') != "youtu.be") {
        videoID = searchTerm.split("youtu.be/")[1];
      }

      //fetch image and title from videoID and add to playlist
      fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" +
      videoID + "&key=" + key )
      .then(res => res.json())
      .then(data => {
        var videoData = {
        title : data.items[0].snippet.title,
        videoID : data.items[0].id,
        imgURL : data.items[0].snippet.thumbnails.default.url
        }
        socket.emit("userAddedVideoToPlaylist",videoData,sessionStorage.getItem("roomID"))
        setSearchTerm("");
        setShowAddToPlaylistFromURLButton(false);
      })
    }
    return (
        <div className="searchContainer" onBlur={event => hideSearchOnExit(event)}>
            <a href="/">
                <img src={Logo} id="logoImg"/>
            </a>
            <div className="copyLinkContainer copyLinkButton">
                {linkCopied && <p>Copied!</p>}
                <Button variant="contained" color="primary" onClick={copyLink}>Copy Link</Button>
            </div>
            <div
            className="searchBarAndResultsContainer showPointerOnHover"
            style={showAddToPlaylistFromURLButton ?
              {"marginRight" : undefined}
              :
              {"marginRight" : "auto" }}
              >
                <p className="error">{props.error}</p>
                <input
                className='searchBar inputFocus'
                name='searchTerm' value={searchTerm}
                onChange={event => handleSearchChange(event)}
                onKeyPress={searchInputEnterPressed}
                placeholder="Search or paste a youtube url here ..."
                />
                <SearchResult
                searchResults={searchResults}
                setSearchResults={setSearchResults}
                setSearchTerm={setSearchTerm}
                />
            </div>
            {showAddToPlaylistFromURLButton &&
              <button
              className="addFromURLButton"
              onClick={addToPlaylistFromURL}>Add to Playist</button>
            }
            <ToggleOptions
            toggleBlockMinimize={props.toggleBlockMinimize}
            blockMinimize={props.blockMinimize}
            toggleAutoPlay={props.toggleAutoPlay}
            autoPlay={props.autoPlay}
            />
            <div className="searchBarButtonContainer">
              <Button variant="contained"
              color="secondary"
              onClick={() => {
                  GA.event({
                    category : "bug report",
                    action : "User opened bug report window"
                  })
                  props.setShowBugReport(true)}}>
                Bug report
              </Button>
              <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setShowPlaylistAndChat(!showPlaylistAndChat)
                setPlayerClass(playerClass === "playerContainer" ?
                "playerContainerExtended"
                :
                "playerContainer")
              }}>
              {showPlaylistAndChat ? "Hide" : "Show"}
              </Button>
            </div>
        </div>
    )
}
export default SearchBar;
