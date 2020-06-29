import React from 'react'

function UsernameModal (props) {
    return(
        <div className="usernameModalFullscreen">
            <div className="usernameModalChoice">
                <p>Choose your Username</p>
                <input className="usernameChoiceInput inputFocus" name="changeName" value={props.changeName} onChange={props.handleChange}/>
                <button className="defaultButton changeNameButton" onClick={props.changeUsername}>Submit</button>
            </div>
        </div>
    )
    
}

export default UsernameModal