import React from 'react'

const UsernameModal = props =>
    <div className="usernameModalFullscreen">
        <div className="usernameModalChoice">
            <p className="error">{props.nameError}</p>
            <p>Choose your Username</p>
            <input
            className="usernameChoiceInput inputFocus"
            name="changeName"
            value={props.changeName}
            onChange={props.handleChange}
            onKeyPress={(event) => {return event.which == 13 ? props.changeUsername() : false}}
            />
            <button className="defaultButton changeNameButton" onClick={props.changeUsername}>Submit</button>
        </div>
    </div>

export default UsernameModal
