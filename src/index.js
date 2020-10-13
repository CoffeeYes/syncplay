import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core'

const theme = createMuiTheme({
  palette : {
    primary : {
      main : "#673ab7"
    },
    secondary : {
      main : "#00b0ff"
    }
  }
});
ReactDOM.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
    </BrowserRouter>,
  document.getElementById('root')
);
