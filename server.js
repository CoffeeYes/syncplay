const express = require('express');
const bodyParser = require('body-parser')

const app = express();

const io = require('socket.io')();
const socketPort = 5001;

generateRandomRoomString = () => {
    let roomString = Math.random().toString(36).substring(5);
    return roomString
}

app.get('/test', (req,res,next) => {
    console.log("test received")
})

io.on('connection', (client) => {
    
    client.on('videoIdWasChangedByClient', (videoID,roomCode) => {
        console.log("video ID Changed to : " + videoID)
        io.to(roomCode).emit("anotherClientChangedVideoId",videoID)
    })

    client.on("requestCreateNewRoom",(userID) => {
        //create random room string and join it
        let newRoomId = generateRandomRoomString();
        client.join(newRoomId);
        io.to(userID).emit("roomCreatedSuccesfully",newRoomId)
    })

    client.on("userJoinedRoom",(roomCode) => {
        client.leaveAll();
        client.join(roomCode);
    })
})


io.listen(socketPort);
app.listen(process.env.PORT || 5000);