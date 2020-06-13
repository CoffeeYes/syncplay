import React, {Component} from 'react';

class Splash extends Component {
    render = () => {
        return (
            <div className="verticalCenter horizontalCenter splash">
                <div className="splashContentContainer">
                    <h1>Create a room, Send the link to your friends and watch together!</h1>
                    <button id="createRoomButton" onClick={this.props.createNewRoom}>Create Room</button>
                </div>
                
            </div>
        )
    }
}

export default Splash