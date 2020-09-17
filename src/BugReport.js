import React from 'react';
import reactGA from './ReactGA';
import {Button} from '@material-ui/core';

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
              <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowBugReport(false)}
              className="closeBugReportButton defaultButton">x</Button>
              <textarea id="bugReportText"></textarea>
              <Button
              variant="contained"
              color="primary"
              className="defaultButton submitBugReportButton"
              onClick={submitBugReport}>Submit</Button>
          </div>
      </div>
  )
}
export default BugReport
