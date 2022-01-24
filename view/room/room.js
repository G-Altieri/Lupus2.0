//console.log("Room js file");
jQuery(function () {

  //variable
  var socket = io();
  var nickname;
  var admin;
  var numPlayer;

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

  //Sent Nickname
  $('#entra').on('click', function () {
    addNickname();
  });
  function addNickname() {
    nickname = jQuery('#nickname').val();
    socket.emit("add nickname", { nickname: nickname });
  }


  //Join in Room
  socket.on("add nickname ok", (x) => {
    joinInRoom();
  });
  function joinInRoom() {
    console.log("Join in room: " + room);
    changeView(['entra', 'nickname'], ['disconettiti', 'lobby','numPlayers','progress']);
  }



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
    var x = $('#admin1').val();
    socket.emit("change admin", { room: room, admin: x });
    console.log("change admin " + x);
  });



  //List of Users
  socket.on("UsersInRoom", (dataSocket) => {
    admin = dataSocket[0].admin;
    console.log("admin "+admin);
    dataSocket = dataSocket.slice(1);
    numPlayer = dataSocket.length;
    setAdmin(dataSocket);
  });


  //Error 
  socket.on("error", (err) => {
    console.log(err);
    errorView(true, err);
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

  function errorView(view, err) {
    if (view) {
      $('#error').removeClass("invisible");
      $('#error').html(err);
    } else {
      $('#error').addClass("invisible");
      $('#error').html("");
    }
  }

  function setAdmin(dataSocket) {
    if (admin == nickname) {
      var users = "";
      if (dataSocket != undefined) {
        dataSocket.forEach(x => {
          if (x.nickname === nickname)
            users = users + '<li class="bg-success">' + x.nickname + '</li>';
          else
            users = users + '<li>' + x.nickname + '<a class="mx-3" style="color:red; id="'+x.nickname+'">     X</a>' +'</li>';
        });
      }
      $('#players').html(users);
      $('#numPlayers').html("Player: "+numPlayer);
      changeView('', ['btnStartGame']);
    } else {
      changeView(['btnStartGame'], '');
      listPlayer(dataSocket);
    }
  }

  $('#players').on("click", "li a", e => console.log(e.attr('id')));


  function listPlayer(dataSocket){
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
    $('#numPlayers').html("Player: "+numPlayer);
  }

  //Alert before Reload
  /*window.onbeforeunload = function(e){
    console.log(e);
    alert('Thanks And Bye!');
    return 'Sei sicuro di Uscire?';
  };*/
  //function OhAdmin(){}




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
      begin: function () {
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
      begin: function () {
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
      begin: function () {
        $('.iconLeaf').removeClass("opacity0");
      },
    }, '1500')




});///$




