import React,{ Component } from 'react';
import SearchResult from './SearchResult'
import ToggleOptions from './ToggleOptions'

import Logo from './assets/Logo.png'

class SearchBar extends Component {
    render = () => {
        return (
            <div className="searchContainer">
                <a href="/">
                    <img src={Logo} id="logoImg"/>
                </a>
                <div className="copyLinkContainer copyLinkButton">
                    {this.props.linkCopied && <p>Copied!</p>}
                    <button className="defaultButton" onClick={this.props.copyLink}>Copy Link</button>
                </div>
                <div className="searchBarAndResultsContainer showPointerOnHover" style={this.props.showAddToPlaylistFromURLButton ? {"marginRight" : undefined} : {"marginRight" : "auto" }}>
                    <p className="error">{this.props.error}</p>
                    <input className='searchBar inputFocus'
                    name='searchTerm' value={this.props.searchTerm}
                    onChange={this.props.handleChange}
                    onKeyPress={this.props.searchInputEnterPressed}
                    placeholder="Search or paste a youtube url here ..."
                    />
                    <SearchResult
                    searchResults={this.props.searchResults}
                    userClickedSearchResult={(videoID) => this.props.userClickedSearchResult(videoID)}
                    addVideoToPlaylist={(videoObj => this.props.addVideoToPlaylist(videoObj))}
                    />
                </div>
                {this.props.showAddToPlaylistFromURLButton &&
                  <button className="addFromURLButton" onClick={this.props.addToPlaylistFromURL}>Add to Playist</button>
                }
                <ToggleOptions toggleBlockMinimize={this.props.toggleBlockMinimize} blockMinimize={this.props.blockMinimize}/>
                <button className="defaultButton bugButton" onClick={this.props.triggerBugReport}>Submit a Bug Report</button>
            </div>
        )
    }
}

export default SearchBar;
