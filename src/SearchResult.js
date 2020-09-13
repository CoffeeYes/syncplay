import React from 'react';
import socket from './Socket'

const SearchResult = props => {
  const {setSearchResults, setSearchTerm } = props;

  const addVideoToPlaylist = videoObj => {
      var videoData = {
      title : videoObj.snippet.title,
      videoID : videoObj.id.videoId,
      imgURL : videoObj.snippet.thumbnails.default.url
    }

    socket.emit("userAddedVideoToPlaylist",videoData,sessionStorage.getItem("roomID"))
  }

  const userClickedSearchResult = videoID => {
    socket.emit('videoIdWasChangedByClient',videoID,sessionStorage.getItem("roomID"),0);
    setSearchTerm("");
    setSearchResults([]);
  }
  
  return (
      <div className="searchResultsContainer">
      {props.searchResults && props.searchResults.map((item,index) =>
        <div className="searchResultContainer showPointerOnHover">
        <div className="searchResultData" key={index} onClick={() => userClickedSearchResult(item.id.videoId)}>
        <img src={item.snippet.thumbnails.default.url} className="searchResultImage"/>
        <div className="searchResultTitleContainer">
        <p className="searchResultTitle">{item.snippet.title}</p>
        </div>
        </div>
        <button className="addToPlaylistButton" onClick={() => addVideoToPlaylist(item)}>Add to Playlist</button>
        </div>
      )}
      </div>
  )
}
export default SearchResult
