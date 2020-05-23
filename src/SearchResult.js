import React, { Component} from 'react';

class SearchResult extends Component {
    render = () => {
        return (
            <div className="searchResultsContainer">
                {this.props.searchResults.map((item,index) => {
                    return (
                        <div className="searchResultContainer">
                            <div className="searchResultData" key={index} onClick={() => this.props.userClickedSearchResult(item.id.videoId)}>
                                <img src={item.snippet.thumbnails.default.url}/>
                                <p>{item.snippet.title}</p>
                            </div>
                            <button onClick={() => this.props.addVideoToPlaylist(item)}>+</button>
                        </div>
                        
                    )
                })}
            </div>
        )
    }
}

export default SearchResult