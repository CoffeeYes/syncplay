const express = require('express');
const bodyParser = require('body-parser')

const app = express();

const io = require('socket.io')();
const socketPort = 5001;

const path = require('path');

var roomMetaData = {};

//use build folder
app.use( express.static( `${__dirname}/build` ) );

getRandomColor = () => {
    //https://stackoverflow.com/questions/23601792/get-only-light-colors-randomly-using-javascript
    //code for generating random light color using hue,saturation,lightness (hsl) function
    //0 DEG = red, 120 DEG = green, 240 DEG = blue, generate random degree number, 100% saturation, 75% lightness
    color = "hsl(" + Math.random() * 360 + ", 100%, 75%)";
    return color;
  }

generateRandomRoomString = () => {
    let roomString = Math.random().toString(36).substring(5);
    return roomString
}

createMessage = (msg,clientID,roomID) => {
    return {
        user : roomMetaData[roomID].usernames[clientID],
        text : msg,
        time : "0:0",
        color : roomMetaData[roomID].userColours[clientID],
        messageSender : clientID
    }
}

emitConnectedUsers = (roomID) => {
    io.to(roomID).emit("receiveConnectedUsers",Object.values(roomMetaData[roomID].usernames))
}

app.get('/test', (req,res,next) => {
    console.log("test received")
})

app.get('*', (req, res)=>{  res.sendFile(path.join(__dirname, './build/index.html'));})

io.on('connection', (client) => {
    //send client their ID so that they can identify message origin for conditional rendering
    client.on("clientGetSocketID",() => {
      io.to(client.id).emit("clientReceiveSocketID",client.id)
    })

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
        roomMetaData[newRoomID].userColours = {};

        roomMetaData[newRoomID].connectedUsers = [];
        roomMetaData[newRoomID].connectedUsers.push(client.id)

        roomMetaData[newRoomID].usernames = {};
        roomMetaData[newRoomID].usernames[client.id] = client.id

        roomMetaData[newRoomID].playingUsers = [];
        roomMetaData[newRoomID].pausedUsers = [];
        roomMetaData[newRoomID].timeChangeUsers = [];
        roomMetaData[newRoomID].minimizedUsers = []

        roomMetaData[newRoomID].playlist = [];
        roomMetaData[newRoomID].playlistIndex = -1;

        roomMetaData[newRoomID].currentVideoID = "gGdGFtwCNBE";

        roomMetaData[newRoomID].blockState = true;
        roomMetaData[newRoomID].autoPlay = false;

        io.to(userID).emit("roomCreatedSuccesfully",newRoomID)
    })

    client.on("userJoinedRoom",(roomID) => {
        //check if room exists
        if(roomMetaData[roomID] == undefined) {
            return io.emit("clientError","Room does not exist")
        }
        //join passed room in sockets
        client.join(roomID);
        //add user to connected users array
        roomMetaData[roomID].connectedUsers.push(client.id)
        //set clients username as socketio client id, can be changed
        roomMetaData[roomID].usernames[client.id] = client.id

        roomMetaData[roomID].newestUser = "";
        //send videoID
        io.to(client.id).emit("receiveCurrentVideoID",roomMetaData[roomID].currentVideoID)
        io.to(client.id).emit("hydratePlaylistState",roomMetaData[roomID].playlist,roomMetaData[roomID].playlistIndex)
        io.to(client.id).emit("receiveCurrentBlockState",roomMetaData[roomID].blockState)
        io.to(client.id).emit("anotherUserChangedAutoPlay",roomMetaData[roomID].autoPlay)
        emitConnectedUsers(roomID)

        //assign new user a random color for messages, repeat until color is unique
        var usedColor = true;
        while(usedColor) {
          var color = getRandomColor();
          usedColor = false
          roomMetaData[roomID].userColours[client.id] = color;
          for(var key in Object.keys(roomMetaData[roomID].userColours)) {
            if(roomMetaData[roomID].userColours[key] == color) {
              usedColor = true;
            }
          }
        }

        //emit join message to users in room
        /*
        var joinedMessage = client.id + " joined the room"
        io.to(roomID).emit("receiveNewMessage",createMessage(joinedMessage,client.id,roomMetaData[roomID].userColours[client.id]))
        */
    })

    client.on("userPlayedVideo",(roomID) => {
        client.to(roomID).emit("anotherUserPlayedVideo");
        //clear paused user array
        roomMetaData[roomID].pausedUsers = []
        //add user to playing array
        roomMetaData[roomID].playingUsers.push(client.id)
        //let other users know who played the video through chat message
        if(roomMetaData[roomID].playingUsers.length == 1) {
            var username = roomMetaData[roomID].usernames[client.id];
            var colour =roomMetaData[roomID].userColours[client.id];
            var msg = createMessage([username + " played the video"],client.id,roomID)
            if(roomMetaData[roomID].usernames[client.id] != client.id) {
              io.to(roomID).emit("receiveNewMessage",msg)
            }
        }
    })

    client.on("userPausedVideo", (time,roomID) => {
        client.to(roomID).emit("anotherUserPausedVideo",time);
        //clear playing users array
        roomMetaData[roomID].playingUsers = [];
        //add user to paused array
        roomMetaData[roomID].pausedUsers.push(client.id)
        //let other users know who paused the video through chat message
        if(roomMetaData[roomID].pausedUsers.length == 1) {
            var username = roomMetaData[roomID].usernames[client.id];
            var colour =roomMetaData[roomID].userColours[client.id];
            var msg = createMessage([username + " paused the video"],client.id,roomID)
            if(roomMetaData[roomID].usernames[client.id] != client.id) {
              io.to(roomID).emit("receiveNewMessage",msg)
            }
        }
    })

    client.on("newUserRequestTime",(roomID) => {
        //get clients currently connected to room
        var clients = io.sockets.adapter.rooms[roomID].sockets;
        clients = Object.keys(clients);

        if(clients.length > 1) {
            io.to(clients[0]).emit("requestCurrentTimeStamp");
        }
    })

    client.on("newUserLoadedVideo", (roomID) => {
        io.to(roomMetaData[roomID].connectedUsers[0]).emit("newUserJoinedRoom",client.id)
    })

    client.on("newUserMustPause", (newUserID) => {
        io.to(newUserID).emit("newUserMustPause");
    })

    client.on("receiveCurrentTime",(time,roomID,newClientID) => {
        //io.to(roomID).emit("syncTimeWithNewUser",time,roomMetaData[roomID].currentVideoID);
        io.to(newClientID).emit("newUserReceiveVideoAndTimeStamp",time,roomMetaData[roomID].currentVideoID);
    })

    client.on("userChangedTimeWhilePaused", (time,roomID) => {
        //only allow timechange signalling to take place for novel time changes, if condition prevents repeated timechanges from timechange signal receivers
        if(Math.round(time) != Math.round(roomMetaData[roomID].currentTimeChange) ) {
            roomMetaData[roomID].currentTimeChange = time;

            //add user to timesync array
            roomMetaData[roomID].timeChangeUsers.push(client.id);

            //emit new time to all users except the one who changed the timestamp while paused
            io.to(roomID).emit("anotherUserChangedTimeWhilePaused",time);

            //let other users know who changed time
            if(roomMetaData[roomID].timeChangeUsers.length == 1) {
                //get user data
                var username = roomMetaData[roomID].usernames[client.id];
                var colour =roomMetaData[roomID].userColours[client.id];
                //calculate time from seconds
                var mins = Math.floor(time/60)
                var seconds = Math.round(time % 60)
                var timeText;
                //format time
                if(mins < 10) {
                    timeText = "0" + mins + ":";
                }
                else {
                    timeText = mins = ":"
                }

                if(seconds < 10 ) {
                    timeText += "0" + seconds;
                }
                else {
                    timeText += seconds;
                }
                //send timechange message
                var msg = createMessage([username + " changed the time to " + timeText],client.id,roomID)
                io.to(roomID).emit("receiveNewMessage",msg)
            }
        }

    })

    client.on("synchronizedTimeChange",(roomID) => {
        //get connected clients
        var clients = io.sockets.adapter.rooms[roomID].sockets;
        clients = Object.keys(clients);
        //add user to timesync array
        roomMetaData[roomID].timeChangeUsers.push(client.id);

        //clear time sync array when all users have synced their timestamp, +1 because user who changed time will be in array twice
        if (roomMetaData[roomID].timeChangeUsers.length == clients.length + 1) {
            roomMetaData[roomID].timeChangeUsers = []

            //allow users to play video
            io.to(roomID).emit("allowPlaying")
            io.to(roomID).emit("clientError","")
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

    client.on("newMessage",(msg,roomID) => {
        //create new message object to send to all users
        //user colour is created when user joins the room and stored in roomMetadata
        var message = createMessage(msg,client.id,roomID)
        io.to(roomID).emit("receiveNewMessage",message)
    })

    client.on("clientChangedUsername", (name,roomID) => {
        if(roomMetaData[roomID]) {
            //check if username is already taken
            for(var username in roomMetaData[roomID].usernames) {
                if(roomMetaData[roomID].usernames[username] == name) {
                    return io.to(client.id).emit("clientChangeNameReturn",{error : "username is already taken",success : false})
                }
            }
            io.to(client.id).emit("clientChangeNameReturn",{success : true,name : name})
            //change users username in metadata
            roomMetaData[roomID].usernames[client.id] = name;
            //let other users know the user changed their username
            var text = roomMetaData[roomID].usernames[client.id] + " joined the room"
            var message = createMessage(text,client.id,roomID)
            io.to(roomID).emit("receiveNewMessage",message)
            emitConnectedUsers(roomID)
        }
    })

    client.on("userAddedVideoToPlaylist",(videoData,roomID) => {
        client.to(roomID).emit("anotherUserAddedVideoToPlaylist",videoData)
        roomMetaData[roomID].playlist.push(videoData)
    })

    client.on("updatePlaylistIndex",(index,roomID) => {
        roomMetaData[roomID].playlistIndex = index
        io.to(roomID).emit("videoIndexWasUpdated",index)
    })

    client.on("userRemovedVideoFromPlaylist", (index,roomID) => {
        roomMetaData[roomID].playlist.splice(index,1)
        client.to(roomID).emit("anotherUserRemovedVideoFromPlaylist",index)
    })

    client.on("userMinimizedWindow", (roomID) => {
        //stop other users from playing video and display message stating which user is minimized
        io.to(roomID).emit("disallowPlaying")
        if(roomMetaData[roomID]) {
            var string = "User " + roomMetaData[roomID].usernames[client.id] + " has Minimized the window, blocking playback"
            io.to(roomID).emit("clientError",string)
            roomMetaData[roomID].minimizedUsers.push(client.id)
        }
    })

    client.on("userMaximizedWindow", (roomID) => {
        io.to(roomID).emit("allowPlaying");
        io.to(roomID).emit("clientError","")
        if(roomMetaData[roomID]) {
            var minUsers = roomMetaData[roomID].minimizedUsers
            for(var item in minUsers) {
                //remove user from minimized user array
                if(minUsers[item] == client.id) {
                    minUsers.splice(minUsers.indexOf(minUsers[item]),1)
                    roomMetaData[roomID].minimizedUsers = minUsers;
                }

                //if user was last minimized user, allow playback and clear error, otherwise emit other minimized user error to frontend
                if(roomMetaData[roomID].minimizedUsers == "") {
                    io.to(roomID).emit("allowPlaying");
                    io.to(roomID).emit("clientError","");
                }
                else {
                    var username = roomMetaData[roomID].usernames[roomMetaData[roomID].minimizedUsers[0]]
                    io.to(roomID).emit("clientError", "User " + username + " has Minimized the window, blocking playback")
                }
            }
        }

    })
    //synchronise block playback state with all users
    client.on("userChangedBlockMinimize",(roomID,blockState) => {
      io.to(roomID).emit("anotherUserChangedBlockMinimize",blockState)
      roomMetaData[roomID].blockState = blockState;
      //clear minimizedUsers array if not blocking minimize
      if(!blockState) {
        roomMetaData[roomID].minimizedUsers = []
      }
    })

    client.on("userChangedAutoPlay",(roomID,autoPlayState) => {
      io.to(roomID).emit("anotherUserChangedAutoPlay",autoPlayState)
      roomMetaData[roomID].autoPlay = autoPlayState
    })
    client.on("disconnect",() => {
        //find room user disconnected from
        var disconnectingUserRoom = ""
        var index = 0;
        for(var room in roomMetaData) {
            if(roomMetaData[room].connectedUsers.indexOf(client.id) != -1) {
                disconnectingUserRoom = room
                index = roomMetaData[room].connectedUsers.indexOf(client.id)
            }
        }
        if(roomMetaData[disconnectingUserRoom]) {
            var minimizedIndex = roomMetaData[disconnectingUserRoom].minimizedUsers.indexOf(client.id)
            if(minimizedIndex != -1) {
                //remove disconnecting user from minimized users array
                roomMetaData[disconnectingUserRoom].minimizedUsers.splice(minimizedIndex,1)
                //check if disconnecting user was last minimized user, if so allow playback otherwise change frontend error display for other minimized users
                if(roomMetaData[disconnectingUserRoom].minimizedUsers == "") {
                    io.to(disconnectingUserRoom).emit("allowPlaying");
                    io.to(disconnectingUserRoom).emit("clientError","")
                }
                else {
                    var username = roomMetaData[disconnectingUserRoom].usernames[roomMetaData[disconnectingUserRoom].minimizedUsers[0]]
                    io.to(disconnectingUserRoom).emit("clientError","User " + username + " has Minimized the window, blocking playback")
                }
            }
        }
        if(disconnectingUserRoom != "" ) {
            //send disconnect message and remove user from metadata arrays
            var msg = createMessage([roomMetaData[disconnectingUserRoom].usernames[client.id] + " Disconnected"],client.id,disconnectingUserRoom)
            io.to(disconnectingUserRoom).emit("receiveNewMessage",msg)
            roomMetaData[disconnectingUserRoom].connectedUsers.splice(index,1)
            delete roomMetaData[disconnectingUserRoom].usernames[client.id]
            emitConnectedUsers(disconnectingUserRoom)

            //if that user was the last user, delete Metadata value for room ID after 5 seconds to prevent room from being re-created
            if(roomMetaData[disconnectingUserRoom] && roomMetaData[disconnectingUserRoom].connectedUsers == "") {
                setTimeout( () => {
                    if(roomMetaData[disconnectingUserRoom]  && roomMetaData[disconnectingUserRoom].connectedUsers == "") {
                        delete roomMetaData[disconnectingUserRoom]
                    }
                },5000)
            }
        }


    })
})


io.listen(socketPort);
app.listen(process.env.PORT || 5002);
