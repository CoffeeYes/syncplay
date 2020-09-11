import React,{ Component, useEffect, useState } from 'react';
import SearchResult from './SearchResult'
import ToggleOptions from './ToggleOptions'

import Logo from './assets/Logo.png';
import GA from './ReactGA';
import connect from './connect'
import socket from './Socket'

const key = connect.youtubeAPI.key

const SearchBar = props => {

    const [linkCopied, setLinkCopied] = useState(false);
    const [searchTerm,setSearchTerm] = useState("");
    const [searchResults,setSearchResults] = useState([]);

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
        socket.emit('videoIdWasChangedByClient',this.state.videoID,this.state.roomID,time);
        setSearchTerm("");
        // this.setState({searchTerm : "",showAddToPlaylistFromURLButton : false})
      }
    }
    return (
        <div className="searchContainer" onBlur={event => hideSearchOnExit(event)}>
            <a href="/">
                <img src={Logo} id="logoImg"/>
            </a>
            <div className="copyLinkContainer copyLinkButton">
                {linkCopied && <p>Copied!</p>}
                <button className="defaultButton" onClick={copyLink}>Copy Link</button>
            </div>
            <div
            className="searchBarAndResultsContainer showPointerOnHover"
            style={props.showAddToPlaylistFromURLButton ?
              {"marginRight" : undefined}
              :
              {"marginRight" : "auto" }}
              >
                <p className="error">{props.error}</p>
                <input
                className='searchBar inputFocus'
                name='searchTerm' value={searchTerm}
                onChange={event => {
                  setSearchTerm(event.target.value)
                  event.target.value === "" && setSearchResults([])
                }}
                onKeyPress={searchInputEnterPressed}
                placeholder="Search or paste a youtube url here ..."
                />
                <SearchResult
                searchResults={searchResults}
                userClickedSearchResult={(videoID) => props.userClickedSearchResult(videoID)}
                addVideoToPlaylist={(videoObj => props.addVideoToPlaylist(videoObj))}
                />
            </div>
            {props.showAddToPlaylistFromURLButton &&
              <button
              className="addFromURLButton"
              onClick={props.addToPlaylistFromURL}>Add to Playist</button>
            }
            <ToggleOptions
            toggleBlockMinimize={props.toggleBlockMinimize}
            blockMinimize={props.blockMinimize}
            toggleAutoPlay={props.toggleAutoPlay}
            autoPlay={props.autoPlay}
            />
            <button
            className="defaultButton bugButton"
            onClick={() => {
                GA.event({
                  category : "bug report",
                  action : "User opened bug report window"
                })
                props.setShowBugReport(true)}}
           >
           Submit a Bug Report
           </button>
        </div>
    )
}
export default SearchBar;
