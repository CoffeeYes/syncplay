import socketClient from 'socket.io-client'
import connect from './connect.js'

var socket = socketClient(connect.serverData.socketURL)

export default socket;
