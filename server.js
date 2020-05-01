const express = require('express');
const bodyParser = require('body-parser')

const app = express();

const io = require('socket.io')();
const socketPort = 5001;

var roomMetaData = {};

generateRandomRoomString = () => {
    let roomString = Math.random().toString(36).substring(5);
    return roomString
}

app.get('/test', (req,res,next) => {
    console.log("test received")
})

+app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

io.on('connection', (client) => {

    client.on('videoIdWasChangedByClient', (videoID,roomID,time) => {
        io.to(roomID).emit("anotherClientChangedVideoId",videoID,time)
        //save current video of given room
        roomMetaData[roomID].currentVideoID = videoID;
    })

    client.on("requestCreateNewRoom",(userID) => {
        //create random room string and join it
        var newRoomID = generateRandomRoomString();
        client.join(newRoomID);

        roomMetaData[newRoomID] = {};
        roomMetaData[newRoomID].owner = client.id;

        roomMetaData[newRoomID].currentVideoID = "";

        io.to(userID).emit("roomCreatedSuccesfully",newRoomID)
    })

    client.on("userJoinedRoom",(roomID) => {
        client.join(roomID);

        io.to(client.id).emit("receiveCurrentVideoID",roomMetaData[roomID].currentVideoID)
    })

    client.on("userPlayedVideo",(roomID) => {
        client.to(roomID).emit("anotherUserPlayedVideo");
    })

    client.on("userPausedVideo", (roomID) => {
        client.to(roomID).emit("anotherUserPausedVideo");
    })

    client.on("newUserRequestTime",(roomID) => {
        //get clients currently connected to room
        var clients = io.sockets.adapter.rooms[roomID].sockets;
        clients = Object.keys(clients);

        if(clients.length > 1) {
            io.to(clients[0]).emit("requestCurrentTimeStamp");
        }
    })

    client.on("receiveCurrentTime",(time,roomID) => {
        io.to(roomID).emit("syncTimeWithNewUser",time,roomMetaData[roomID].currentVideoID);
    })

    client.on("userChangedTimeWhilePaused", (time,roomID) => {
        io.to(roomID).emit("anotherUserChangedTimeWhilePaused",time);
    })

    client.on("resyncTimeOnPause", (time,roomID) => {
        io.to(roomID).emit("anotherUserChangedTimeWhilePaused",time);
    })
})


io.listen(socketPort);
app.listen(process.env.PORT || 5002);
