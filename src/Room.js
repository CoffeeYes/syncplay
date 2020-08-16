import React, { Component, useState, useEffect } from 'react';
import Player from './Player.js'
import SearchBar from './SearchBar.js'

import ChatBox from './ChatBox.js'
import Playlist from './Playlist'
import BugReport from './BugReport'
import UsernameModal from './UsernameModal'
import CacheAccept from './CacheAccept.js';

const Room = props => {

    useEffect(() => {
        //re-hydrate room state after losing on redirect
        let roomID = window.location.href.split("/room/")[1]
        props.initializeRoom(roomID)
    },[])

    return(
        <div className="mainContainerRoom">
            {props.showCacheDialogue &&
            <CacheAccept
            handleCacheChoice={(choice) => props.handleCacheChoice(choice)}
            />
            }
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
            triggerBugReport={props.triggerBugReport}
            copyLink={props.copyLink}
            linkCopied={props.linkCopied}
            showAddToPlaylistFromURLButton={props.showAddToPlaylistFromURLButton}
            addToPlaylistFromURL={props.addToPlaylistFromURL}
            toggleBlockMinimize={props.toggleBlockMinimize}
            blockMinimize={props.blockMinimize}
            toggleAutoPlay={props.toggleAutoPlay}
            autoPlay={props.autoPlay}
            hideSearchOnExit={event => props.hideSearchOnExit(event)}
            />
            <Player videoSource={props.videoSource}/>
            <Playlist
            playlistVideos={props.playlistVideos}
            videoFromPlaylistWasClicked={(videoID, index) => props.videoFromPlaylistWasClicked(videoID, index)}
            removeVideoFromPlaylist={(index) => props.removeVideoFromPlaylist(index)}
            />
            <ChatBox
            localMessage={props.localMessage}
            messages={props.messages}
            sendMessage={props.sendMessage}
            handleChange={props.handleChange}
            changeName={props.changeName}
            changeUsername={props.changeUsername}
            chatError={props.chatError}
            connectedUsers={props.connectedUsers}
            />
            {props.showBugReport && <BugReport closeBugReport={props.closeBugReport} submitBugReport={props.submitBugReport}/>}
        </div>
    )
}

export default Room
