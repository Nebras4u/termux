
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let messages = [];
let users = new Map();

io.on('connection', (socket) => {
    let username = null;

    socket.on('join', (name) => {
        username = name;
        users.set(socket.id, name);
        socket.broadcast.emit('message', { user: '🟢 النظام', text: `${name} انضم إلى الدردشة.` });
        socket.emit('history', messages);
    });

    socket.on('chat message', (msg) => {
        const message = { user: username, text: msg };
        messages.push(message);
        if (messages.length > 20) messages.shift();
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        if (username) {
            users.delete(socket.id);
            socket.broadcast.emit('message', { user: '🔴 النظام', text: `${username} غادر الدردشة.` });
        }
    });
});

http.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});
