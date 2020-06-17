import React,{ Component } from 'react';
import SearchResult from './SearchResult'

import Logo from './assets/Logo.png'

class SearchBar extends Component {
    render = () => {
        return (
            <div className="searchContainer">
                <a href="/">
                    <img src={Logo} id="logoImg"/>
                </a>
                <div className="searchBarAndResultsContainer">
                    <p className="error">{this.props.error}</p>
                    <input className='searchBar inputFocus' name='searchTerm' value={this.props.searchTerm} onChange={this.props.handleChange} onKeyPress={this.props.searchInputEnterPressed}
                    placeholder="Search or paste a youtube url here ..."
                    />
                    <SearchResult 
                    searchResults={this.props.searchResults} 
                    userClickedSearchResult={(videoID) => this.props.userClickedSearchResult(videoID)}
                    addVideoToPlaylist={(videoObj => this.props.addVideoToPlaylist(videoObj))}
                    />
                </div>

                <button className="defaultButton bugButton" onClick={this.props.triggerBugReport}>Submit a Bug Report</button>
            </div>
        )
    }
}

export default SearchBar;