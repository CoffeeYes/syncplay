import React from 'react'

const ToggleOptions = (props) => {
  return (
    <div className="toggleSliderContainer">
      <p>Block Minimizing</p>
      <label className="switch">
        <input type="checkbox" checked={props.blockMinimize}onClick={props.toggleBlockMinimize}/>
        <span className="slider round"></span>
      </label>
    </div>
  )
}

export default ToggleOptions
