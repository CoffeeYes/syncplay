import React, { Component} from 'react';

class SearchResult extends Component {
    render = () => {
        return (
            <div className="searchResultsContainer">
                {this.props.searchResults.map((item,index) => {
                    return (
                        <div className="searchResultContainer showPointerOnHover">
                            <div className="searchResultData" key={index} onClick={() => this.props.userClickedSearchResult(item.id.videoId)}>
                                <img src={item.snippet.thumbnails.default.url} className="searchResultImage"/>
                                <p className="searchResultTitle">{item.snippet.title}</p>
                            </div>
                            <button className="addToPlaylistButton" onClick={() => this.props.addVideoToPlaylist(item)}>Add to Playlist</button>
                        </div>

                    )
                })}
            </div>
        )
    }
}

export default SearchResult
