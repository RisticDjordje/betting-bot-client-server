const express = require('express'); //requires express module
const socket = require('socket.io'); //requires socket.io module
const fs = require('fs');
const app = express();

var PORT = process.env.PORT || 3000;
const server = app.listen(PORT); //hosts server on localhost:3000

console.log('Server is running. Listening at PORT: ' + PORT);
const io = socket(server);


var count = 0;


//Socket.io Connection------------------
io.on('connection', (socket) => {

    // When a new Client connection is opened.
    console.log("New socket connection: " + socket.id)

    // Sending a message to CLIENT that they have connected
    socket.emit('connected', socket.id)

    socket.on('disconnect', function () {
        console.log("User disconnected. ID: " + socket.id)
    });

    socket.on('counter', () => {
        count++;
        console.log(count)
        socket.emit('counter', count);
    })


    // LEFT BUTTON
    // When the Client clicks LEFT button
    socket.on('left_button', () => {
        console.log("Left Button has been pressed.")
        // This is where the function should be run



        // Letting the Client know LEFT has been received
        socket.emit('left_button_received');
    })


    // RIGHT BUTTON
    // When the Client clicks RIGHT button
    socket.on('right_button', () => {
        console.log("Right Button has been pressed.")
        // This is where the function should be run



        // Letting the Client know LEFT has been received
        socket.emit('right_button_received');
    })


    // SEND BUTTON
    // When the Client clicks SEND button
    socket.on('sendUsername', (username) => {
        console.log(username)



        // Letting the Client know USERNAME has been received
        socket.emit('username_received', (username));
    })
})