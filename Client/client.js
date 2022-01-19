jQuery(function () {

  var socket = io();
  var nickname;
  var room;

/*Connection with server*/
  console.log("Client Ready");
  socket.on('connect', () => {console.log("Server Connected");})




  jQuery('#game').on('click', function () {
    nickname = jQuery('#nickname').val();
    room = jQuery('#room').val();
    console.log(nickname);

    socket.emit("join", { roomID: room, nickname: nickname });

  });



  jQuery('#disconettiti').on('click', function () {

    socket.disconnect();
    console.log("Disconesso dal server");
  });


  socket.on( "UsersInRoom", (dataSocket) => {
    console.log(dataSocket);
  });

});