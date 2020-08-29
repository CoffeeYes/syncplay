import React, { Component, useState, useEffect } from 'react';
import Player from './Player.js'
import SearchBar from './SearchBar.js'

import ChatBox from './ChatBox.js'
import Playlist from './Playlist'
import BugReport from './BugReport'
import UsernameModal from './UsernameModal'
import CacheAccept from './CacheAccept.js';

const Room = props => {

    const [showBugReport,setShowBugReport] = useState(false);
    const [showPlaylistAndChat,setShowPlaylistAndChat] = useState(true);
    const [playerClass, setPlayerClass] = useState("playerContainer");

    useEffect(() => {
        //re-hydrate room state after losing on redirect
        let roomID = window.location.href.split("/room/")[1]
        props.initializeRoom(roomID)
    },[])

    return(
        <div className="mainContainerRoom">
            <CacheAccept
            handleCacheChoice={(choice) => props.handleCacheChoice(choice)}
            />
            { props.showUsernameModal &&
                <UsernameModal
                changeName={props.changeName}
                handleChange={props.handleChange}
                changeUsername={props.changeUsername}
                nameError={props.nameError}
                />
            }
            <SearchBar
            handleChange={props.handleChange}
            searchInputEnterPressed={props.searchInputEnterPressed}
            searchResults={props.searchResults}
            searchTerm={props.searchTerm}
            userClickedSearchResult={(videoID) => props.userClickedSearchResult(videoID)}
            addVideoToPlaylist={(videoObj => props.addVideoToPlaylist(videoObj))}
            error={props.error}
            showAddToPlaylistFromURLButton={props.showAddToPlaylistFromURLButton}
            addToPlaylistFromURL={props.addToPlaylistFromURL}
            blockMinimize={props.blockMinimize}
            autoPlay={props.autoPlay}
            hideSearchOnExit={event => props.hideSearchOnExit(event)}
            setShowBugReport={setShowBugReport}
            />
            <Player videoSource={props.videoSource} playerClass={playerClass}/>
            {
                <div
                onClick={() => {
                  setShowPlaylistAndChat(!showPlaylistAndChat)
                  setPlayerClass(playerClass === "playerContainer" ?
                  "playerContainerExtended"
                  :
                  "playerContainer")
                }}
                className="togglePlaylistAndChat showPointerOnHover"
                >
                {showPlaylistAndChat ? "Hide" : "Show"}
                </div>
            }
            {showPlaylistAndChat &&
            <Playlist
            playlistVideos={props.playlistVideos}
            videoFromPlaylistWasClicked={(videoID, index) => props.videoFromPlaylistWasClicked(videoID, index)}
            removeVideoFromPlaylist={(index) => props.removeVideoFromPlaylist(index)}
            />}
            {showPlaylistAndChat &&
            <ChatBox
            localMessage={props.localMessage}
            messages={props.messages}
            sendMessage={props.sendMessage}
            handleChange={props.handleChange}
            changeName={props.changeName}
            changeUsername={props.changeUsername}
            chatError={props.chatError}
            />
            }
            {showBugReport &&
            <BugReport
            submitBugReport={props.submitBugReport}
            setShowBugReport={setShowBugReport}
            />}
        </div>
    )
}

export default Room
