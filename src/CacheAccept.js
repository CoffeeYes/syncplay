import React, { useEffect, useState } from 'react'
import { Button } from '@material-ui/core'

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
              <p className="cacheAcceptText">This Website uses cookies.
              <br/>Click accept if you consent to the use of functional cookies.</p>
              <div className="cacheButtonContainer">
                  <Button
                  onClick={() => handleCacheChoice("reject")}
                  variant="outlined"
                  className="cacheRejectButton"
                  color="secondary">Reject</Button>
                  <Button
                  onClick={() => handleCacheChoice("accept")}
                  variant="contained"
                  color="primary">Accept</Button>
              </div>
          </div>
      </div>
      :
      null
}

export default CacheAccept
