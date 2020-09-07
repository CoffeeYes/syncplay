import React,{ Component, useEffect, useState } from 'react';
import SearchResult from './SearchResult'
import ToggleOptions from './ToggleOptions'

import Logo from './assets/Logo.png';
import GA from './ReactGA'

const SearchBar = props => {

    const [linkCopied, setLinkCopied] = useState(false)

    const copyLink = () => {
        var link = window.location.href;
        navigator.clipboard.writeText(link);
        setLinkCopied(true)

        setTimeout(() => {
          setLinkCopied(false)
        },400)
    }
    return (
        <div className="searchContainer" onBlur={event => props.hideSearchOnExit(event)}>
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
                <input className='searchBar inputFocus'
                name='searchTerm' value={props.searchTerm}
                onChange={props.handleChange}
                onKeyPress={props.searchInputEnterPressed}
                placeholder="Search or paste a youtube url here ..."
                />
                <SearchResult
                searchResults={props.searchResults}
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
