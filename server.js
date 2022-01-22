import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

//variable Exspress
const app = express();
const port = 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const view = 'view';

//variable client
var allClients = [];

//variable server
var roomCodeList = ["casetta", "mandria", "pianezza"];
var roomCodeUsed = [];
var adminRoom = { "casetta": null, "mandria": null, "pianezza": null };

//Connection with client
io.on("connection", (socket) => {
    allClients.push(socket);
    socket.on('join', (data) => {
        socket.data.roomID = data.roomID.replace('/', '');
        socket.join(socket.data.roomID);
        console.log(" join in room:" + socket.data.roomID);
    });
    //Listen for add nickname
    socket.on('add nickname', (data) => {
        if (adminRoom[socket.data.roomID] == null) {
            adminRoom[socket.data.roomID] = data.nickname;
        }
        socket.data.nickname = data.nickname;
        console.log(" add nickname:" + socket.data.nickname);
        listUsersInRoom(socket.data.roomID);
    });

    //Listen for left room ;
    socket.on("change admin", (x) => {
        console.log(x);
        changeAdmin(x.room.replace('/', ''), x.admin);
    });

    //Listen for disconnecting client
    socket.on("disconnecting", (reason) => {
        var x = socket.data.roomID;
        listUsersInRoom(socket.data.roomID);
        removeClient(socket);
        controllEmptyRoom(x);
    });
    socket.on("disconnect", (reason) => {
        var x = socket.data.roomID;
        listUsersInRoom(socket.data.roomID);
        removeClient(socket);
        controllEmptyRoom(x);
    });

    //Listen for left room ;
    socket.on("left room", (reason) => {
        socket.leave(socket.data.roomID);
        console.log(socket.data.nickname + ' left room: ' + socket.data.roomID);
        removeClient(socket);
        controllEmptyRoom(socket.data.roomID);
        listUsersInRoom(socket.data.roomID);
    });
});

//Function Usefull
function removeClient(socket) {
    //Controllo se esce l admin
    if (socket.data.nickname == adminRoom[socket.data.roomID]) {
        changeAdmin(socket.data.roomID);
    }
    var i = allClients.indexOf(socket);
    if (i != -1) {
        allClients.splice(i, 1);
    }
}
//Change Admin
function changeAdmin(room, nick) {
    if (nick == undefined) {
        var clientRoom = allClients.find(element => { return element.data.roomID == room })
        if (clientRoom != undefined) {
            adminRoom[room] = clientRoom.data.nickname;
        }
    } else {
        console.log("Ehi");
        var clientRoom = allClients.find(element => { return element.data.roomID == room && element.data.nickname == nick })
        console.log(clientRoom);
        if (clientRoom != undefined) {
            adminRoom[room] = clientRoom.data.nickname;
        }
    }
    console.log(adminRoom[room] + " e il nuovo admin della stanza: " + room)
    listUsersInRoom(room);
}
//List User in room
async function listUsersInRoom(x) {
    const sockets = await io.in(x).fetchSockets();
    var dataSocket = [];
    dataSocket.push({ admin: adminRoom[x] });
    for (const socket of sockets) {
        dataSocket.push(socket.data);
    }
    io.to(x).emit("UsersInRoom", dataSocket);
}

//Random Code Room
function getCodeRoom() {
    var listTemp = [];
    for (var i = 0; i < roomCodeList.length; i++) {
        //Controllo room usate
        if (roomCodeUsed.length == 0) {
            listTemp = roomCodeList;
        } else {
            //Controllo room tra quelle usate
            if (!roomCodeUsed.find(element => { if (element == roomCodeList[i]) return true; else return false; })) {
                listTemp.push(roomCodeList[i]); //Se non usata la salvo per l estrazione
            }
        }
    }
    //Se le room sono piene
    if (listTemp.length === 0) {
        console.log("Room piene");
    } else {
        var x = listTemp[Math.floor(Math.random() * listTemp.length)]
        roomCodeUsed.push(x);
    }
    return x;
}
function controllEmptyRoom(x) {
    var listTemp = [];
    if (allClients.length > 0) {
        for (var i = 0; i < allClients.length; i++) {
            if (allClients[i].data.roomID == x) {
                listTemp.push(x);
            }
        }
    }
    if (listTemp.length == 0) {
        if (x != undefined) {
            var i = roomCodeUsed.indexOf(x);
            if (i != -1) {
                roomCodeUsed.splice(i, 1);
            }
            console.log("La stanza: " + x + " torna libera");
        }

    }
}


//Open Server
httpServer.listen(port, () => console.log("in ascolto alla porta " + port));

//Router
app.use(express.static(view));
app.get('/', (req, res) => {
    res.sendFile(path.resolve(view));
});
//For room
app.use('/room/:roomID', express.static(view + "/room"));
//For new room code
app.use('/newRoom', function (req, res) {
    res.send(getCodeRoom());
});





/*
function listUsers() {
    allClients.forEach((x, i) => {
        console.log((i + 1) + " Socket Id" + x.id + " nickname: " + x.data.nickname + " room: " + x.data.roomID);
    });
}

/*
app.get('/room/:roomID', function (req, res) {
    
   // res.sendFile(path.resolve(view + '/room'));
  // res.redirect("/room.html");
    // roomId=req.params.roomID;
    // console.log("a:"+req.params.roomID);
});*/