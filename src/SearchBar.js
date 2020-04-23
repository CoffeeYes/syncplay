import React,{ Component } from 'react';

class SearchBar extends Component {
    render = () => {
        return (
            <input id='searchBar' name='searchTerm' onChange={this.props.handleChange} onKeyPress={this.props.searchInputEnterPressed}/>
        )
    }
}

export default SearchBar;