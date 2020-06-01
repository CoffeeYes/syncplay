import React, {Component} from 'react';

class Splash extends Component {
    render = () => {
        return (
            <div className="verticalCenter horizontalCenter">
                <button onClick={this.props.createNewRoom}>Create Room</button>
            </div>
        )
    }
}

export default Splash