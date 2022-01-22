//console.log("Room js file");
jQuery(function () {

  //variable
  var socket = io();
  var nickname;
  var admin;

  //Read room
  const queryString = window.location.href;
  console.log(queryString);
  const room = queryString.substring(queryString.lastIndexOf("room/") + 5);

  //Connection with server
  console.log("Client Ready");
  socket.on('connect', () => { console.log("Server Connected"); })
  $(document).ready(function () {
    socket.emit("join", { roomID: room });
  });

  //Join in Room
  $('#entra').on('click', function () {
    joinInRoom();
  });

  //Room
  function joinInRoom() {
    nickname = jQuery('#nickname').val();
    socket.emit("add nickname", { nickname: nickname });
    console.log("Join in room: " + room);
    changeView(['entra', 'nickname'], ['disconettiti', 'ListPlayer']);
  }



  //Event

  //Button Disconettiti
  $('#disconettiti').on('click', function () {
    //socket.disconnect();
    socket.emit("left room");
    console.log("Left to room: " + room);
    changeView(['disconettiti', 'ListPlayer'], ['entra', 'nickname']);
    window.location.replace('/');
  });

    //Button Change Admin
    $('#admin2').on('click', function () {
      var x=$('#admin1').val();
      socket.emit("change admin",{room:room, admin:x});
      console.log("change admin " + x);
    });

  //Listen

  //List of Users
  socket.on("UsersInRoom", (dataSocket) => {
    var users = "";
    admin=dataSocket[0].admin;
    dataSocket=dataSocket.slice(1);
    if (dataSocket != undefined) {
      dataSocket.forEach(x => {
        //Set Admin
        if (admin == x.nickname) {
          setAdmin();
        }
        if (x.nickname == nickname && admin != nickname) {
          users = users + "<br>" + '<div style="color:green;">' + x.nickname + "</div>";
        }
        if (x.nickname != nickname && admin != x.nickname) {
          users = users + "<br>" + x.nickname;
        }
      });
    }
    $('#listPlayer').html(users);
  });


  //Function Usefull
  function changeView(x, k) {
    for (i = 0; i < x.length; i++) {
      $('#' + x[i]).addClass("hidden");
    }
    for (i = 0; i < k.length; i++) {
      $('#' + k[i]).removeClass("hidden");
    }
  }


  function setAdmin() {
    if (admin == nickname){
      $('#admin').html('<div style="color:green;">' + admin + "</div>" + "<hr>");
      changeView('', ['admin1', 'admin2']);
    }else{
      $('#admin').html(admin + "<hr>");
      changeView(['admin1', 'admin2'], '');
    }
  }

  
    //function OhAdmin(){}
});///$




