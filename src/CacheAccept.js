import React, { useEffect, useState } from 'react'

const CacheAccept = props => {
    const [showCacheDialogue,setShowCacheDialogue] = useState(false)

    useEffect(() => {
        if(!localStorage.getItem("cacheAcceptance")) {
            setShowCacheDialogue(true);
        }
    },[])

    const handleCacheChoice = choice => {
        if(choice === "accept") {
            setShowCacheDialogue(false)
            localStorage.setItem("cacheAcceptance",true)
        }
        else {
            window.location.href = "www.google.com"
        }
    }
    return showCacheDialogue ?
      <div className="cacheAcceptModal">
          <div className="cacheAcceptContent">
              <p className="cacheAcceptText">This Website uses cookies.<br/>Click accept if you consent to the use of functional cookies.</p>
              <div className="cacheButtonContainer">
                  <button onClick={() => handleCacheChoice("reject")} className="cacheRejectButton">Reject</button>
                  <button onClick={() => handleCacheChoice("accept")} className="defaultButton">Accept</button>
              </div>
          </div>
      </div>
      :
      null
}

export default CacheAccept
