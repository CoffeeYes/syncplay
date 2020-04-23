const express = require('express');
const bodyParser = require('body-parser')

const app = express();

const io = require('socket.io')();
const socketPort = 5001;

app.get('/test', (req,res,next) => {
    console.log("test received")
})

io.on('connection', (client) => {
    console.log("client connected" +  client)

    client.on('videoIdWasChangedByClient', (videoID) => {
        console.log("video ID Changed to : " + videoID)
        io.emit("anotherClientChangedVideoId",videoID)
    })
})


io.listen(socketPort);
app.listen(process.env.PORT || 5000);