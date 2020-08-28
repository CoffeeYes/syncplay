import connect from './connect.js'
import reactGA from 'react-ga'

reactGA.initialize(connect.ga.TID);

export default reactGA
