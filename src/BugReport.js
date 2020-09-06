import React from 'react';
import reactGA from './ReactGA'

const BugReport = ({setShowBugReport }) => {
    const submitBugReport = () => {
      setShowBugReport(false)
      reactGA.event({
        category: "bug report",
        action : "User submitted bug report"
      })
    }
    return (
      <div className="bugReportCoverPage">
          <div className="bugReportContainer">
              <button onClick={() => setShowBugReport(false)} className="closeBugReportButton defaultButton">x</button>
              <textarea id="bugReportText"></textarea>
              <button className="defaultButton submitBugReportButton" onClick={submitBugReport}>Submit</button>
          </div>
      </div>
  )
}
export default BugReport
