import express from "express";
import {
    createServer
} from "http";
import {
    Server
} from "socket.io";
import path from "path";

//variable Exspress
const app = express();
const port = process.env.PORT || 80;//process.env.PORT || 80 //3000
const httpServer = createServer(app);
const io = new Server(httpServer, {
    /* options */
});
const view = 'view';

//variable client
var allClients = [];

//variable server
var roomCodeList = ["casetta", "mandria", "pianezza"];
var roomCodeUsed = [];
var adminRoom = {
    "casetta": null,
    "mandria": null,
    "pianezza": null
};
var inGame = {
    "casetta": false,
    "mandria": false,
    "pianezza": false
};

//Connection with client
io.on("connection", (socket) => {
    allClients.push(socket);
    socket.on('join', (data) => {
        socket.data.roomID = data.roomID.replace('/', '');
        socket.join(socket.data.roomID);
        console.log("New Socket join in room:" + socket.data.roomID);
    });
    //Listen for add nickname
    socket.on('add nickname', (data) => {
        var x = false;
        let regx = /^[a-zA-Z0-9]+$/;
        if (!inGame[socket.data.roomID]) {
            if (regx.test(data.nickname)) {
                var k = allClients.find(element => {
                    return element.data.nickname == data.nickname
                });
                if (k != undefined)
                    if (k.data.nickname == data.nickname)
                        emitError("Nickname gia utilizzato, cambiarlo");
                    else
                        x = true;

                else
                    x = true;
            } else {
                emitError("Inserisci un Nickname Valido");
            }
            //Add nickname
            if (x) {
                if (adminRoom[socket.data.roomID] == null) {
                    adminRoom[socket.data.roomID] = data.nickname;
                    console.log(data.nickname + " e l admin di : " + adminRoom[socket.data.roomID]);
                }
                socket.data.nickname = data.nickname;
                console.log("Add nickname:" + socket.data.nickname);
                listUsersInRoom(socket.data.roomID);
                socket.emit("add nickname ok", "ok");
            }

        } else {
            emitError("La partita e in corso... Attendere");
        }

    });

    //Listen for left room ;
    socket.on("change admin", (x) => {
        console.log(x);
        changeAdmin(x.room.replace('/', ''), x.admin);
    });

    //Listen for disconnecting client
    socket.on("disconnecting", (reason) => {
        var x = socket.data.roomID;
        removeClient(socket);
        controllEmptyRoom(x);
        listUsersInRoom(socket.data.roomID);
    });
    socket.on("disconnect", (reason) => {
        var x = socket.data.roomID;
        removeClient(socket);
        controllEmptyRoom(x);
        listUsersInRoom(socket.data.roomID);
    });

    //Listen for left room ;
    socket.on("left room", (reason) => {
        socket.leave(socket.data.roomID);
        console.log(socket.data.nickname + ' left room: ' + socket.data.roomID);
        removeClient(socket);
        controllEmptyRoom(socket.data.roomID);
        listUsersInRoom(socket.data.roomID);
    });
    //Listen for kick player ;
    socket.on("kick", (x) => {
        var y = allClients.find(element => {
            return element.data.roomID == x.room.replace('/', '') && element.data.nickname == x.nickname
        })
        if (y != undefined) {
            y.leave(y.data.roomID);
            y.emit("kicked");
            console.log(y.data.nickname + ' kick in room: ' + y.data.roomID);
            removeClient(y);
            controllEmptyRoom(y.data.roomID);
            listUsersInRoom(y.data.roomID);
        }
    });


    //Listen Init Game
    socket.on("initGame", (x) => {
        var room = x.room.replace('/', '');
        io.to(room).emit("initGame", {});
        inGame[room] = true;
        listUsersInRoom(room);
        console.log("Start Game in room: " + room);
    });
    //Listen End Game
    socket.on("endGame", (x) => {
        endGame(x.room.replace('/', ''))
    });


    //Generate ruoli
    socket.on("generate ruoli", async(ruoli) => {
        //Selected Ruoli
        var ruoliSelect = [];
        for (var key in ruoli) {
            for (var i = 0; i < ruoli[key]; i++) {
                ruoliSelect.push(key);
            }
        }

        //Generazione numeri random
        var number = []; //Varibile per randomizare univocamente
        while (number.length < ruoliSelect.length) {
            var r = Math.floor(Math.random() * ruoliSelect.length);
            if (number.indexOf(r) === -1) number.push(r);
        }

        //Randomize Ruoli
        var listTemp = [];
        for (var i in number) {
            listTemp[number[i]] = ruoliSelect[i];
        }

        var players = await listUsersInRoom(socket.data.roomID, true);
        //console.log(players)
        console.log("Ruoli generati per la room: " + socket.data.roomID);
        io.to(socket.data.roomID).emit("ruoli generati ok", {
            ruoli: listTemp,
            players: players
        });

    });

    //Gestion Error
    function emitError(err) {
        socket.emit("error", err);
    }

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
    var send = false;
    if (nick == undefined) {
        var clientRoom = allClients.find(element => {
            return element.data.roomID == room
        })
        if (clientRoom != undefined && clientRoom.data.nickname != undefined) {
            adminRoom[room] = clientRoom.data.nickname;
            send = true;
        }
    } else {
        var clientRoom = allClients.find(element => {
            return element.data.roomID == room && element.data.nickname == nick
        })
        console.log(clientRoom);
        if (clientRoom != undefined) {
            adminRoom[room] = clientRoom.data.nickname;
            send = true;
        }
    }
    if (send) {
        console.log(adminRoom[room] + " e il nuovo admin della stanza: " + room)
        listUsersInRoom(room);
    } else {
        console.log(room + " non c e un admin valido");
        adminRoom[room] = null;
        //endGame(room);
        listUsersInRoom(room);
    }
}
//List User in room
async function listUsersInRoom(x, ret) {
    const sockets = await io.in(x).fetchSockets();
    var dataSocket = [];
    dataSocket.push({
        admin: adminRoom[x]
    });
    for (const socket of sockets) {
        if (socket.data.nickname != undefined)
            dataSocket.push(socket.data);
    }
    if (ret)
        return dataSocket;
    else
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
            if (!roomCodeUsed.find(element => {
                    if (element == roomCodeList[i]) return true;
                    else return false;
                })) {
                listTemp.push(roomCodeList[i]); //Se non usata la salvo per l estrazione
            }
        }
    }
    //Se le room sono piene
    if (listTemp.length === 0) {
        console.log("Room piene");
        x = "full";
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
            adminRoom[x] = null;
            inGame[x] = false;
        }

    }
}

function endGame(room) {
    inGame[room] = false;
    io.to(room).emit("endGame", {});
    listUsersInRoom(room);
    console.log("End Game in room: " + room);
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
app.use('/newRoom', function(req, res) {
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