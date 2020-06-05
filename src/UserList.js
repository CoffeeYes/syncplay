import React, {Component} from 'react'

class UserList extends Component {
    render = () => {
        return (
            <div className="userListContainer">
                <p className="connectedUserText">Connected Users :</p>
                {this.props.connectedUsers.map((item,index) => {
                    return <p key={index} className="connectedUserText">{item},</p>
                })}
            </div>
        )
    }
    
}

export default UserList