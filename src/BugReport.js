import React from 'react';

const BugReport = (props) => {
    return (
        <div className="bugReportCoverPage">
            <div className="bugReportContainer">
                <button onClick={props.closeBugReport} className="closeBugReportButton defaultButton">x</button>
                <textarea id="bugReportText"></textarea>
                <button className="defaultButton submitBugReportButton" onClick={props.submitBugReport}>Submit</button>
            </div>
        </div>
        
    )
}

export default BugReport