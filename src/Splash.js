import React, {Component} from 'react';

class Splash extends Component {
    render = () => {
        return (
            <div className="main">
                <button onClick={this.props.createNewRoom}>Create Room</button>
            </div>
        )
    }
}

export default Splash