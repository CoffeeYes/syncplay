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

        //init roomMetadata for this room
        roomMetaData[newRoomID] = {};
        roomMetaData[newRoomID].newestUser = "";
        roomMetaData[newRoomID].owner = client.id;
        roomMetaData[newRoomID].syncedUserlist = []

        roomMetaData[newRoomID].currentVideoID = "";

        io.to(userID).emit("roomCreatedSuccesfully",newRoomID)
    })

    client.on("userJoinedRoom",(roomID) => {
        if(roomMetaData[roomID] == undefined) {
            return io.emit("clientError","Room does not exist")
        }
        client.join(roomID);

        roomMetaData[roomID].newestUser = "";

        io.to(client.id).emit("receiveCurrentVideoID",roomMetaData[roomID].currentVideoID)
    })

    client.on("userPlayedVideo",(roomID) => {
        client.to(roomID).emit("anotherUserPlayedVideo");
    })

    client.on("userPausedVideo", (time,roomID) => {
        client.to(roomID).emit("anotherUserPausedVideo",time);
    })

    client.on("newUserRequestTime",(roomID) => {
        //get clients currently connected to room
        var clients = io.sockets.adapter.rooms[roomID].sockets;
        clients = Object.keys(clients);

        if(clients.length > 1) {
            io.to(clients[0]).emit("requestCurrentTimeStamp");
        }
    })

    client.on("receiveCurrentTime",(time,roomID,newClientID) => {
        //io.to(roomID).emit("syncTimeWithNewUser",time,roomMetaData[roomID].currentVideoID);
        io.to(newClientID).emit("newUserReceiveVideoAndTimeStamp",time,roomMetaData[roomID].currentVideoID);
    })

    client.on("userChangedTimeWhilePaused", (time,roomID) => {
        var clients = io.sockets.adapter.rooms[roomID].sockets;
        clients = Object.keys(clients);

        //emit new time to all users except the one who changed the timestamp while paused
        for(var item in clients) {
            if(clients[item] != client.id) {
                io.to(clients[item]).emit("anotherUserChangedTimeWhilePaused",time);
            }
        }

        //block users from playing while we wait for all clients to send back timeSyncedToOtherPausedUser signal
        io.to(roomID).emit("disallowPlaying")
        io.to(roomID).emit("clientError","Waiting for all users to synchronise")
    })

    client.on("timeSyncedToOtherPausedUser",(roomID) => {
        //add client to response array for timesync
        roomMetaData[roomID].syncedUserlist.push(client.id);

        //get all clients connected in room
        var clients = io.sockets.adapter.rooms[roomID].sockets;
        clients = Object.keys(clients);

        //check if we have responses from all users in room
        if(roomMetaData[roomID].syncedUserlist.length == clients.length) {
            //allow users to play video
            io.to(roomID).emit("allowPlaying")
            io.to(roomID).emit("clientError","")
            //reset timesync array
            roomMetaData[roomID].syncedUserlist = []
        }
    })

    client.on("resyncTimeOnPause", (time,roomID) => {
        io.to(roomID).emit("anotherUserChangedTimeWhilePaused",time);
    })

    client.on("newUserRequestVideoIdAndTimeStamp",(roomID) => {
        //send error if room doesnt exist
        if(roomMetaData[roomID] == undefined) {
            return io.to(client.id).emit("clientError","Room does not exist")
        }
        //get clients in room
        var clients = io.sockets.adapter.rooms[roomID].sockets;
        clients = Object.keys(clients);

        //if other clients are already in the room request time from them
        if(clients.length > 1) {
            //request time from 1st user of room, pass execution to receiveCurrentTime
            io.to(clients[0]).emit("requestCurrentTimeStamp",client.id);
        }
        //if new user is first user to join room emit saved ID and 0 timestamp
        else {
            io.to(client.id).emit("newUserReceiveVideoAndTimeStamp",0,roomMetaData[roomID].currentVideoID)
        }
    })
})


io.listen(socketPort);
app.listen(process.env.PORT || 5002);
