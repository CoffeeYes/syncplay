import React from 'react'

const ToggleOptions = (props) => {
  return (
    <div className="toggleSliderContainer">
      <div className="toggleSliderItem">
        <p>Block Minimizing</p>
        <label className="switch">
          <input type="checkbox" checked={props.blockMinimize}onClick={props.toggleBlockMinimize}/>
          <span className="slider round"></span>
        </label>
      </div>
      <div className="toggleSliderItem">
        <p>Autoplay</p>
        <label className="switch">
          <input type="checkbox" checked={props.autoPlay}onClick={props.toggleAutoPlay}/>
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  )
}

export default ToggleOptions
