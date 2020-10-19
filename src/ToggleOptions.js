import React from 'react'
import { Switch } from '@material-ui/core'

import socket from './Socket'

const ToggleOptions = ({ autoPlay, blockMinimize, scrollToMsgBottom,
                         setScrollToMsgBottom}) => {

  const toggleBlockMinimize = () => {
    socket.emit("userChangedBlockMinimize",sessionStorage.getItem("roomID"),!blockMinimize)
  }

  const toggleAutoPlay = () => {
    socket.emit("userChangedAutoPlay",sessionStorage.getItem("roomID"),!autoPlay)
  }

  return (
    <div className="toggleSliderContainer">
      <div className="toggleSliderItem">
        <p>Block Minimizing</p>
        <Switch
        checked={blockMinimize}
        onChange={toggleBlockMinimize}
        color="secondary"/>
      </div>
      <div className="toggleSliderItem">
        <p>Autoplay</p>
        <Switch
        checked={autoPlay}
        onChange={toggleAutoPlay}
        color="secondary"/>
      </div>
      <div className="toggleSliderItem">
        <p>Scroll to Bottom</p>
        <Switch
        checked={scrollToMsgBottom}
        onChange={() => setScrollToMsgBottom(!scrollToMsgBottom)}
        color="secondary"/>
      </div>
    </div>
  )
}

export default ToggleOptions
