import React from 'react';

const SearchResult = props =>
<div className="searchResultsContainer">
    {props.searchResults && props.searchResults.map((item,index) =>
      <div className="searchResultContainer showPointerOnHover">
          <div className="searchResultData" key={index} onClick={() => props.userClickedSearchResult(item.id.videoId)}>
              <img src={item.snippet.thumbnails.default.url} className="searchResultImage"/>
              <div className="searchResultTitleContainer">
                <p className="searchResultTitle">{item.snippet.title}</p>
              </div>
          </div>
          <button className="addToPlaylistButton" onClick={() => props.addVideoToPlaylist(item)}>Add to Playlist</button>
      </div>
    )}
</div>

export default SearchResult
