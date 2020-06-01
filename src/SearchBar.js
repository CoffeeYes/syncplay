import React,{ Component } from 'react';
import SearchResult from './SearchResult'

class SearchBar extends Component {
    render = () => {
        return (
            <div className="searchContainer">
                <div className="searchBarAndResultsContainer">
                    <p className="error">{this.props.error}</p>
                    <input id='searchBar' name='searchTerm' value={this.props.searchTerm} onChange={this.props.handleChange} onKeyPress={this.props.searchInputEnterPressed}/>
                    <SearchResult 
                    searchResults={this.props.searchResults} 
                    userClickedSearchResult={(videoID) => this.props.userClickedSearchResult(videoID)}
                    addVideoToPlaylist={(videoObj => this.props.addVideoToPlaylist(videoObj))}
                    />
                </div>
            </div>
        )
    }
}

export default SearchBar;