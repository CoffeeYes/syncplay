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
    
    client.on('videoIdWasChangedByClient', (videoID,roomID) => {
        console.log("video ID Changed to : " + videoID)
        io.to(roomID).emit("anotherClientChangedVideoId",videoID)
    })

    client.on("requestCreateNewRoom",(userID) => {
        //create random room string and join it
        let newRoomId = generateRandomRoomString();
        client.join(newRoomId);
        io.to(userID).emit("roomCreatedSuccesfully",newRoomId)
    })

    client.on("userJoinedRoom",(roomID) => {
        client.leaveAll();
        client.join(roomID);
    })

    client.on("userPlayedVideo",(roomID) => {
        client.to(roomID).emit("anotherUserPlayedVideo");
    })

    client.on("userPausedVideo", (roomID) => {
        client.to(roomID).emit("anotherUserPausedVideo");
    })
})


io.listen(socketPort);
app.listen(process.env.PORT || 5000);