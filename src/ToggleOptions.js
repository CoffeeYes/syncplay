import React from 'react'

import socket from './Socket'

const ToggleOptions = (props) => {

  const toggleBlockMinimize = () => {
    socket.emit("userChangedBlockMinimize",sessionStorage.getItem("roomID"),!props.blockMinimize)
  }

  const toggleAutoPlay = () => {
    socket.emit("userChangedAutoPlay",sessionStorage.getItem("roomID"),!props.autoPlay)
  }

  return (
    <div className="toggleSliderContainer">
      <div className="toggleSliderItem">
        <p>Block Minimizing</p>
        <label className="switch">
          <input type="checkbox" checked={props.blockMinimize} onClick={toggleBlockMinimize}/>
          <span className="slider round"></span>
        </label>
      </div>
      <div className="toggleSliderItem">
        <p>Autoplay</p>
        <label className="switch">
          <input type="checkbox" checked={props.autoPlay} onClick={toggleAutoPlay}/>
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  )
}

export default ToggleOptions
