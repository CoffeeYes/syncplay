import React, { Component, useState, useEffect } from 'react';
import Player from './Player.js'
import SearchBar from './SearchBar.js'
import { Button } from '@material-ui/core'

import ChatBox from './ChatBox.js'
import Playlist from './Playlist'
import BugReport from './BugReport'
import UsernameModal from './UsernameModal'
import CacheAccept from './CacheAccept.js';

const Room = props => {

    const [showBugReport,setShowBugReport] = useState(false);
    const [showPlaylistAndChat,setShowPlaylistAndChat] = useState(true);
    const [playerClass, setPlayerClass] = useState("playerContainer");
    const [showUsernameModal,setShowUsernameModal] = useState(true);
    const [scrollToMsgBottom,setScrollToMsgBottom] = useState(true);

    useEffect(() => {
        //re-hydrate room state after losing on redirect
        let roomID = window.location.href.split("/room/")[1]
        props.initializeRoom(roomID)

        if(sessionStorage.getItem("username")) {
          setShowUsernameModal(false);
        }
    },[])

    return(
        <div className="mainContainerRoom">
            <CacheAccept
            handleCacheChoice={choice => props.handleCacheChoice(choice)}
            />
            { showUsernameModal &&
            <UsernameModal setShowUsernameModal={setShowUsernameModal}/> }
            <SearchBar
            searchResults={props.searchResults}
            error={props.error}
            blockMinimize={props.blockMinimize}
            autoPlay={props.autoPlay}
            setShowBugReport={setShowBugReport}
            setShowPlaylistAndChat={setShowPlaylistAndChat}
            showPlaylistAndChat={showPlaylistAndChat}
            setPlayerClass={setPlayerClass}
            playerClass={playerClass}
            scrollToMsgBottom={scrollToMsgBottom}
            setScrollToMsgBottom={setScrollToMsgBottom}
            />
            <Player videoSource={props.videoSource} playerClass={playerClass}/>
            {showPlaylistAndChat &&
            <>
              <Playlist
              playlistVideos={props.playlistVideos}
              />
              <ChatBox
              messages={props.messages}
              chatError={props.chatError}
              scrollToMsgBottom={scrollToMsgBottom}
              />
            </>}
            {showBugReport &&
            <BugReport
            setShowBugReport={setShowBugReport}
            />}
        </div>
    )
}

export default Room
