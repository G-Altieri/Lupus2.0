import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const port = 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const view = 'view';
// public files
app.use(express.static(view));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(view + '/room.html'));
});

var allClients = [];

io.on("connection", (socket) => {
    allClients.push(socket);
    socket.on('join', (data) => {
        socket.data.nickname = data.nickname;
         socket.data.roomID = data.roomID;
        socket.join(socket.data.roomID);
        console.log(socket.data.nickname + " join in room:"+ socket.data.roomID );
        listUsersInRoom(socket.data.roomID);

    });

    socket.on("left room", (reason) => {
        socket.leave(socket.data.roomID);
        console.log(socket.data.nickname+' left room: '+socket.data.roomID);
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
        socket.emit("UsersInRoom");
        listUsersInRoom(socket.data.roomID);
    });
 


    socket.on("disconnect", (reason) => {
        //console.log(reason)
       // console.log('Got disconnect!');
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
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
httpServer.listen(port,  () => console.log("in ascolto alla porta " + port));

app.get('/room/:roomID', function(req, res) {
    res.sendFile(path.resolve(view + '/room.html'));
   // roomId=req.params.roomID;
   // console.log("a:"+req.params.roomID);
  });





async function listUsers() {
    allClients.forEach((x, i) => {
        console.log((i + 1) + " Socket Id" + x.id + " nickname: " + x.data.nickname + " room: " + x.data.roomID);
    });
}