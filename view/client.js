//jQuery(function () {
/*
 var socket = io();
  var nickname;
  var room;
/*
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);
  const product = urlParams.get('product')
  console.log(product);

  /*Connection with server*/
 /* console.log("Client Ready");
  socket.on('connect', () => { console.log("Server Connected"); })

/*
  $('#crea').on('click', function () {

  });
*/
/*
  //Room
  function joinInRoom(){
    console.log("ASdasdasdsadd");
    //nickname = jQuery('#nickname').val();
   
    room = jQuery('#inputCodiceStanza').val();

    socket.emit("join", {nickname: "Giovanni" });
    console.log("Join in room: " + room);
    //changeView(['room', 'nickname', 'game'], ['disconettiti']);
  }

  function changeView(x, k) {
    for (i = 0; i < x.length; i++) {
      $('#' + x[i]).addClass("hidden");
    }
    for (i = 0; i < k.length; i++) {
      $('#' + k[i]).removeClass("hidden");
    }

  }
/*
  jQuery('#disconettiti').on('click', function () {
    //socket.disconnect();
    socket.emit("left room");
    console.log("Left to room: " + room);
    changeView(['disconettiti'], ['room', 'nickname', 'game']);
  });


  socket.on("UsersInRoom", (dataSocket) => {
    // console.log(dataSocket);
    var users = "";
    if (dataSocket != undefined) {
      dataSocket.forEach(x => {
        users = users + "<br>" + x.nickname;
      });
    }

    $('#ListPlayer').html(users);
  });*/

//});