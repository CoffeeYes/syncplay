import React from 'react';

const BugReport = ({closeBugReport, submitBugReport, setShowBugReport }) =>
    <div className="bugReportCoverPage">
        <div className="bugReportContainer">
            <button onClick={() => setShowBugReport(false)} className="closeBugReportButton defaultButton">x</button>
            <textarea id="bugReportText"></textarea>
            <button className="defaultButton submitBugReportButton" onClick={submitBugReport}>Submit</button>
        </div>
    </div>

export default BugReport
