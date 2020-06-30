import React from 'react'

function CacheAccept (props) {
    return (
        <div className="cacheAcceptModal">
            <div className="cacheAcceptContent">
                <p className="cacheAcceptText">This Website uses cookies.<br/>Click accept if you consent to the use of functional cookies.</p>
                <button onClick={() => props.handleCacheChoice("reject")}>Reject</button>
                <button onClick={() => props.handleCacheChoice("accept")}>Accept</button>
            </div>
        </div>
    )
}

export default CacheAccept