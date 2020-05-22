import React, { Component} from 'react';

class SearchResult extends Component {
    render = () => {
        return (
            <div className="searchResultsContainer">
                {this.props.searchResults.map((item,index) => {
                    return (
                        <div className="searchResult" key={index} onClick={() => this.props.userClickedSearchResult(item.id.videoId)}>
                            <img src={item.snippet.thumbnails.default.url}/>
                            <p>{item.snippet.title}</p>
                        </div>
                    )
                })}
            </div>
        )
    }
}

export default SearchResult