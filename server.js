const express = require('express');
const bodyParser = require('body-parser')

const app = express();

const io = require('socket.io')();
const socketPort = 5001;

var roomMetaData = {};

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

createMessage = (msg,username,clientColour) => {
    var currentDate = new Date(Date.now())
    var hours = currentDate.getHours()
    var minutes = currentDate.getMinutes()

    if(minutes < 10) {
        minutes = "0" + minutes
    }

    if(hours < 10) {
        hours = "0" + hours
    }
    return {
        user : username,
        text : msg,
        time : hours + ":" + minutes,
        color : clientColour
    }
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
        roomMetaData[newRoomID].userColours = {};

        roomMetaData[newRoomID].connectedUsers = [];
        roomMetaData[newRoomID].connectedUsers.push(client.id)

        roomMetaData[newRoomID].usernames = {};
        roomMetaData[newRoomID].usernames[client.id] = client.id

        roomMetaData[newRoomID].currentVideoID = "gGdGFtwCNBE";

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

        //give User a random colour for chat 
        roomMetaData[roomID].userColours[client.id] = getRandomColor();
        //emit join message to users in room
        var joinedMessage = client.id + " joined the room"
        io.to(roomID).emit("receiveNewMessage",createMessage(joinedMessage,client.id,roomMetaData[roomID].userColours[client.id]))
    })

    client.on("userPlayedVideo",(roomID) => {
        client.to(roomID).emit("anotherUserPlayedVideo");
        //let other users know who played the video through chat message
        var username = roomMetaData[roomID].usernames[client.id];
        var colour =roomMetaData[roomID].userColours[client.id];
        var msg = createMessage([username + " played the video"],username,colour)
        client.to(roomID).emit("receiveNewMessage",msg)
    })

    client.on("userPausedVideo", (time,roomID) => {
        client.to(roomID).emit("anotherUserPausedVideo",time);
        //let other users know who paused the video through chat message
        var username = roomMetaData[roomID].usernames[client.id];
        var colour =roomMetaData[roomID].userColours[client.id];
        var msg = createMessage([username + " paused the video"],username,colour)
        client.to(roomID).emit("receiveNewMessage",msg)
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

        var username = roomMetaData[roomID].usernames[client.id];
        var colour =roomMetaData[roomID].userColours[client.id];
        var timeText = Math.floor(time/60) + ":" + Math.round(time % 60);
        var msg = createMessage([username + " changed the time to " + timeText],username,colour)
        client.to(roomID).emit("receiveNewMessage",msg)
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

    client.on("newMessage",(msg,roomID) => {
        //create new message object to send to all users
        //user colour is created when user joins the room and stored in roomMetadata
        var message = createMessage(msg,roomMetaData[roomID].usernames[client.id],roomMetaData[roomID].userColours[client.id])

        io.to(roomID).emit("receiveNewMessage",message)
    })

    client.on("clientChangedUsername", (name,roomID) => {
        //check if username is already taken
        for(var username in roomMetaData[roomID].usernames) {
            if(roomMetaData[roomID].usernames[username] == name) {
                return io.to(client.id).emit("chatError","username is already taken")
            }
        }
        //change users username in metadata
        roomMetaData[roomID].usernames[client.id] = name;
        //let other users know the user changed their username
        var text = client.id + " Changed their name to " + roomMetaData[roomID].usernames[client.id]
        var message = createMessage(text,roomMetaData[roomID].usernames[client.id],roomMetaData[roomID].userColours[client.id])
        io.to(roomID).emit("receiveNewMessage",message)
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
        if(disconnectingUserRoom != "" ) {
            //send disconnect message and remove user from metadata arrays
            var msg = createMessage([client.id + " Disconnected"],roomMetaData[disconnectingUserRoom].usernames[client.id],roomMetaData[disconnectingUserRoom].userColours[client.id])
            io.to(disconnectingUserRoom).emit("receiveNewMessage",msg)
            roomMetaData[disconnectingUserRoom].connectedUsers.splice(index,1)
            delete roomMetaData[disconnectingUserRoom].usernames[client.id]

            //if that user was the last user, delete Metadata value for room ID after 5 seconds to prevent room from being re-created
            if(roomMetaData[disconnectingUserRoom].connectedUsers == "") {
                setTimeout( () => {
                    if(roomMetaData[disconnectingUserRoom].connectedUsers == "") {
                        delete roomMetaData[disconnectingUserRoom]
                    }
                },5000)
            }
        }
        

    })
})


io.listen(socketPort);
app.listen(process.env.PORT || 5002);
