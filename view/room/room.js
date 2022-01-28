//console.log("Room js file");
jQuery(function() {

    //variable
    var socket = io();
    var nickname;
    var admin;
    var numPlayer;
    var lobby = false;
    var inGame = false;
    var generate = false;

    //Read room
    const queryString = window.location.href;
    console.log(queryString);
    const room = queryString.substring(queryString.lastIndexOf("room/") + 5);

    //Connection with server
    console.log("Client Ready");
    socket.on('connect', () => {
        console.log("Server Connected");
    })
    $(document).ready(function() {
        socket.emit("join", {
            roomID: room
        });
    });

    //Sent Nickname
    $('#entra').on('click', function() {
        addNickname();
    });
    $('#nickname').on('keypress', function(e) {
        if (e.which == 13) {
            addNickname();
        }
    });

    function addNickname() {
        nickname = jQuery('#nickname').val();
        socket.emit("add nickname", {
            nickname: nickname
        });
    }

    //Join in Room
    socket.on("add nickname ok", (x) => {
        joinInRoom();
    });

    function joinInRoom() {
        errorView(false);
        lobby = true;
        changeView(['inputNickName'], '');
        console.log("Join in room: " + room);
    }

    //List of Users
    socket.on("UsersInRoom", (dataSocket) => {
        admin = dataSocket[0].admin;
        console.log("new List");
        dataSocket = dataSocket.slice(1);
        numPlayer = dataSocket.length;
        renderView(dataSocket);
    });


    //Error 
    socket.on("error", (err) => {
        console.log(err);
        errorView(true, err);
    });


    //kick player
    $('#players').on("click", "li .fa-sign-out-alt ", e => {
        console.log(e);
        if (confirm("Cacciare " + e.currentTarget.id + " ?")) {
            socket.emit("kick", {
                nickname: e.currentTarget.id,
                room: room
            })
        }
    });
    //I m kicked
    socket.on("kicked", (dataSocket) => {
        console.log("kicked by room: " + room);
        window.location.replace('/');
    });


    //Change Admin
    $('#players').on("click", "li .fa-crown ", e => {
        if (confirm("" + e.currentTarget.id + " sara il nuovo Admin")) {
            socket.emit("change admin", {
                room: room,
                admin: e.currentTarget.id
            });
            console.log("change admin " + e.currentTarget.id);
        }
    });

    //Start GAME
    $('#btnInitGame').on("click", function() {
        socket.emit("initGame", {
            room: room
        });
    });
    //End GAME
    $('#btnEndGame').on("click", function() {
        socket.emit("endGame", {
            room: room
        });
    });

    //Listen Init Game
    socket.on("initGame", (x) => {
        console.log("Init Game");
        inGame = true;
    });

    //Listen End Game
    socket.on("endGame", (x) => {
        inGame = false;
        console.log("End Game");
    });


    //Function Usefull
    //Change View 
    function changeView(x, k) {
        for (i = 0; i < x.length; i++) {
            $('#' + x[i]).addClass("hidden");
        }
        for (i = 0; i < k.length; i++) {
            $('#' + k[i]).removeClass("hidden");
        }
    }
    //View Error
    function errorView(view, err) {
        if (view) {
            $('#error').removeClass("invisible");
            $('#error').html(err);
        } else {
            $('#error').addClass("invisible");
            $('#error').html("");
        }
    }
    //Render Admin
    function renderView(dataSocket) {
        if (lobby) {
            if (admin == nickname) {
                var users = "";
                if (dataSocket != undefined) {
                    dataSocket.forEach(x => {
                        if (x.nickname === nickname)
                            users = users + '<li class="bg-success">' + x.nickname + '</li>';
                        else
                            users = users + '<li class="position-relative"><i class="fa fa-crown position-absolute m-2 pe-auto" style="color:#f6ff00; left:50px;" id="' + x.nickname + '"></i>' + x.nickname + '<i class="fa fa-sign-out-alt position-absolute m-2" style="color:red; right:50px;"  id="' + x.nickname + '" ></i>' + '</li>';
                    });
                }
                changeView(['inGameAdmin', 'trAdmin', 'adminView'], ['btnInitGame', 'progress', 'lobby', 'numPlayers']);
            } else {
                var users = "";
                if (dataSocket != undefined) {
                    dataSocket.forEach(x => {
                        if (x.nickname === nickname)
                            users = users + '<li class="bg-success">' + x.nickname + '</li>';
                        else
                            users = users + '<li>' + x.nickname + '</li>';
                    });
                }
                changeView(['inGameAdmin', 'trAdmin', 'adminView', 'btnInitGame'], ['progress', 'lobby', 'numPlayers']);
            }

        } else {

        } //lobby


        if (inGame) {
            if (admin == nickname) {
                changeView(['btnInitGame', 'progress'], ['inGameAdmin', 'trAdmin', 'adminView', 'numPlayers']);
            } else {
                changeView(['btnInitGame', 'progress', 'adminView'], ['inGameAdmin', 'trAdmin', 'numPlayers']);
            }
            //Rimuove l admin dal render generale
            var i = dataSocket.indexOf(dataSocket.find(element => {
                return element.nickname == admin
            }));
            if (i != -1)
                dataSocket.splice(i, 1);
            //Elenco Player 
            var users = "";
            if (dataSocket != undefined) {
                dataSocket.forEach(x => {
                    if (x.nickname === nickname)
                        users = users + '<li class="bg-success">' + x.nickname + '</li>';
                    else
                        users = users + '<li>' + x.nickname + '</li>';
                });
            }
            //Rendere Narratore
            $('#inGameAdmin').html('<div style="background-color: rgb(0 121 225 / 60%);border-radius: 25px;"><i class="fa fa-user-astronaut  mx-4" style="color:red;"></i>Narratore &nbsp; &nbsp; ➜ &nbsp; &nbsp; ' + admin + "</div>");
        } else {
            $('#inGameAdmin').html('');
        } //inGame

        $('#players').html(users);
        $('#numPlayers').html("Player: " + numPlayer);
    }





    //ANIMATION
    //  Titolo Lupus
    var textWrapper = document.querySelector('.ml9 .letters');
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

    //For la mandria
    var textWrapper = document.querySelector('.ml12');
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");


    anime.timeline({
            loop: false
        }) /*Title*/
        .add({
            targets: '.ml9 .letter',
            scale: [0, 1],
            duration: 1500,
            elasticity: 600,
            delay: (el, i) => 45 * (i + 1)
        })

    /*BG*/
    .add({
        targets: '#bg',
        translateX: '-50%',
        translateY: [-60, 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1000,
        delay: 0,
        begin: function() {
            $('#bg').removeClass("opacity0");
        },
    }, '1500')

    /*Mandria*/
    .add({
        targets: '.ml12 .letter',
        scale: [14, 1],
        opacity: [0, 1],
        easing: "easeOutCirc",
        duration: 400,
        delay: (el, i) => 400 * i,
        begin: function() {
            $('.ml12').removeClass("opacity0");
        },
    }, '1000')

    /*Foglia*/
    .add({
        targets: '.iconLeaf',
        translateX: [60, 0],
        translateZ: 0,
        rotate: '50deg',
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 2000,
        delay: 0,
        begin: function() {
            $('.iconLeaf').removeClass("opacity0");
        },
    }, '1500')




}); ///$




/*
  //Button Disconettiti
  $('#disconettiti').on('click', function () {
    //socket.disconnect();
    socket.emit("left room");
    console.log("Left to room: " + room);
    changeView(['disconettiti', 'ListPlayer'], ['entra', 'nickname']);
    window.location.replace('/');
  });
*/



//Alert before Reload
/*window.onbeforeunload = function(e){
  console.log(e);
  alert('Thanks And Bye!');
  return 'Sei sicuro di Uscire?';
};*/
//function OhAdmin(){}


//Player List
/*function listPlayer(dataSocket) {
    var users = "";
    if (dataSocket != undefined) {
        dataSocket.forEach(x => {
            if (x.nickname === nickname)
                users = users + '<li class="bg-success">' + x.nickname + '</li>';
            else
                users = users + '<li>' + x.nickname + '</li>';
        });
    }
    $('#players').html(users);
    $('#numPlayers').html("Player: " + numPlayer);
}*/



/* if (admin == nickname && !inGame) {
       //Render Admin View in lobby NO game start
       var users = "";
       if (dataSocket != undefined) {
           dataSocket.forEach(x => {
               if (x.nickname === nickname)
                   users = users + '<li class="bg-success">' + x.nickname + '</li>';
               else
                   users = users + '<li class="position-relative"><i class="fa fa-crown position-absolute m-2 pe-auto" style="color:#f6ff00; left:50px;" id="' + x.nickname + '"></i>' + x.nickname + '<i class="fa fa-sign-out-alt position-absolute m-2" style="color:red; right:50px;"  id="' + x.nickname + '" ></i>' + '</li>';
           });
       }
       $('#players').html(users);
       $('#numPlayers').html("Player: " + numPlayer);
       changeView(['inGameAdmin', 'trAdmin', 'adminView'], ['btnInitGame', 'progress']);
   } else {
       if (inGame) {
           if (admin == nickname) {
               changeView(['btnInitGame', 'progress'], ['inGameAdmin', 'trAdmin', 'adminView']);
           } else {
               changeView(['btnInitGame', 'progress', 'adminView'], ['inGameAdmin', 'trAdmin']);
           }
           //Rimuove l admin dal render generale
           var i = dataSocket.indexOf(dataSocket.find(element => {
               return element.nickname == admin
           }));
           if (i != -1)
               dataSocket.splice(i, 1);
           $('#inGameAdmin').html('<i class="fa fa-user-astronaut  mx-4" style="color:green;"></i>Narratore &nbsp; &nbsp; ➜ &nbsp; &nbsp; ' + admin);

       } else {
           changeView(['trAdmin', 'adminView', 'btnInitGame'], ['progress']);
           $('#inGameAdmin').html('');
       }

       listPlayer(dataSocket);
   }*/