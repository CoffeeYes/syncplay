import React from 'react'

function CacheAccept (props) {
    return (
        <div className="cacheAcceptModal">
            <div className="cacheAcceptContent">
                <p className="cacheAcceptText">This Website uses cookies.<br/>Click accept if you consent to the use of functional cookies.</p>
                <div className="cacheButtonContainer">
                    <button onClick={() => props.handleCacheChoice("reject")} className="cacheRejectButton">Reject</button>
                    <button onClick={() => props.handleCacheChoice("accept")} className="defaultButton">Accept</button>
                </div>
            </div>
        </div>
    )
}

export default CacheAccept