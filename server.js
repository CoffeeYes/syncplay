const express = require('express');
const bodyParser = require('body-parser')

const app = express();

const io = require('socket.io')();
const socketPort = 5001;

app.get('/test', (req,res,next) => {
    console.log("test received")
})


io.listen(socketPort);
app.listen(process.env.PORT || 5000);