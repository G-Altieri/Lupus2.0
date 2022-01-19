import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";


const app = express();
const port = 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

// public files
app.use(express.static('Client'));


var users = [];


io.on("connection", (socket) => {
    users.push(socket);
    socket.on('join', (data) => {
        socket.data.nickname = data.nickname;
        socket.data.roomID = data.roomID;
        socket.join(socket.data.roomID);
        console.log(socket.data.nickname + " join in room:" + socket.data.roomID);
        listUsersInRoom(socket.data.roomID);

    });


    socket.on("disconnect", (reason) => {
        console.log(reason)
        console.log('Got disconnect!');
        var i = users.indexOf(socket);
        users.splice(i, 1);
        listUsersInRoom(socket.data.roomID);
    });
});



async function listUsersInRoom(x) {
    const sockets = await io.in(x).fetchSockets();
    var dataSocket = [];
    for (const socket of sockets) {
        dataSocket.push(socket.data);
    }
    io.to(x).emit("UsersInRoom", dataSocket);
}



//Open Server
httpServer.listen(port, () => console.log("in ascolto alla porta " + port));








async function listUsers() {
    users.forEach((x, i) => {
        console.log((i + 1) + " Socket Id" + x.id + " nickname: " + x.data.nickname + " room: " + x.data.roomID);
    });
}