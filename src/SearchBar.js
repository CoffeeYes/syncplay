import React,{ Component } from 'react';
import SearchResult from './SearchResult'

class SearchBar extends Component {
    render = () => {
        return (
            <div className="searchContainer">
                <input id='searchBar' name='searchTerm' value={this.props.searchTerm} onChange={this.props.handleChange} onKeyPress={this.props.searchInputEnterPressed}/>
                <SearchResult 
                searchResults={this.props.searchResults} 
                userClickedSearchResult={(videoID) => this.props.userClickedSearchResult(videoID)}
                addVideoToPlaylist={(videoObj => this.props.addVideoToPlaylist(videoObj))}
                />
            </div>
        )
    }
}

export default SearchBar;