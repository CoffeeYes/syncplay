import React from 'react'
import { Switch } from '@material-ui/core'

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
        <Switch
        checked={props.blockMinimize}
        onChange={toggleBlockMinimize}
        color="secondary"/>
      </div>
      <div className="toggleSliderItem">
        <p>Autoplay</p>
        <Switch
        checked={props.autoPlay}
        onChange={toggleAutoPlay}
        color="secondary"/>
      </div>
    </div>
  )
}

export default ToggleOptions
