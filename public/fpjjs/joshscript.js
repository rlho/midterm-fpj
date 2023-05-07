var myGhostyPeer;
var mystream;
var socket;

window.addEventListener("load", function () {
  // socket.io things
  socket = io.connect();

  socket.on("connect", function () {
    console.log("Connected");
  });

  // tell the server that josh is trying to connect
  socket.emit("fpjHostyConnect");

  // this shouldn't happen but I should make this work for futureproofing
  //catch double up connections
  socket.on("fpjHostyDoubleUp", function () {
    // decide what to do with double up joshes
    console.log("host is already connected, redirecting...");
    window.location.replace("../");
  });

  initCapture();
});

function initCapture() {
  console.log("initCapture");
  // camera selecting
  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then(function () {
      if (!navigator.mediaDevices?.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
      } else {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => {
            // devices.forEach(device => {
            //   console.log(device.label);
            // });
            var ioscamera = devices.find(
              (device) => device.label == "Back Ultra Wide Camera"
            );
            var andcamera = devices.find(
              (device) => device.label == "camera2 0, facing back"
            )
            if (ioscamera) {
              var constraints = {
                deviceId: ioscamera.deviceId,
              };
              return navigator.mediaDevices.getUserMedia({
                audio: true,
                video: constraints,
              });
            } else if(andcamera) {
              var constraints = {
                deviceId: andcamera.deviceId,
              };
              return navigator.mediaDevices.getUserMedia({
                audio: true,
                video: constraints,
              });
            } else {
              return navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                  facingMode: "environment",
                },
              });
            }
          })
          .then(function (stream) {
            mystream = stream;
            finishSetupSocket();
          })
          .catch(function (err) {
            /* Handle the error */
            alert(err);
          });
      }
    })
    .catch(function (err) {
      /* Handle the error */
      alert(err);
    });
}

function finishSetupSocket() {
    socket.emit("fpjHostyPing");
  socket.emit("fpjGhostyCheck");

  // Receive connection request from server
  socket.on("fpjGhostyConnect", function (data) {
    // data = {id: string, ghostName: string}
    if (data.id != socket.id) {
      // create a new simplepeer and we'll be the "initiator"
      let simplepeer = new SimplePeerWrapper(true, data.id, socket, mystream);
      myGhostyPeer = simplepeer;
      console.log("clearing idle UI");
      document.getElementById("ghostName").innerHTML = data.ghostName;
      document.getElementById("idleScreen").classList.add("hidden");
      // document.getElementsByClassName('onlyIfConnected').forEach((element) => {
      //     element.classList.remove('hidden');
      // });
      let myelements = document.getElementsByClassName("onlyIfConnected");
      for (var i = 0; i < myelements.length; i++) {
        myelements.item(i).classList.remove("hidden");
      }
      console.log("new ghosty connected: " + data.id);
    }
  });

  // when audience member disconnects
  socket.on("fpjGhostyDisconnect", function (data) {
    console.log("ghosty has disconnected: " + data);
    myGhostyPeer = null;
    // clear out UI and go back to idle page
    console.log("clearing active UI");
    document.getElementById("ghostName").innerHTML = "no one :&#40";
    document.getElementById("idleScreen").classList.remove("hidden");
    let myelements = document.getElementsByClassName("onlyIfConnected");
    for (var i = 0; i < myelements.length; i++) {
      myelements.item(i).classList.add("hidden");
    }
  });

  socket.on("disconnect", function (data) {
    console.log("Socket disconnected");
  });

  socket.on("fpjNewInstruction", function (data) {
    console.log("new instruction: " + data);
    document.getElementById("displayMessageText").innerHTML = data;
  });

  socket.on("fpjClearInstruction", function () {
    console.log("instruction cleared");
    document.getElementById("displayMessageText").innerHTML = "";
  });

  socket.on("fpjMuteToggle", function(isMuted) {
    console.log("mute toggled to " + isMuted);
    document.getElementById(myGhostyPeer.socket_id).muted = isMuted;
  });

  socket.on("fpjSignal", function (to, from, data) {
    console.log("Got a signal from the server: ", to, from, data);

    if (myGhostyPeer.socket_id == from) {
      myGhostyPeer.inputsignal(data);
    } else {
      console.log("signal couldn't find peer");
    }
  });
}

// A wrapper for simplepeer as we need a bit more than it provides
class SimplePeerWrapper {
  constructor(initiator, socket_id, socket, stream) {
    this.simplepeer = new SimplePeer({
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      },
      initiator: initiator,
      trickle: false,
    });

    // Their socket id, our unique id for them
    this.socket_id = socket_id;

    // Socket.io Socket
    this.socket = socket;

    // Our video stream - need getters and setters for this
    this.stream = stream;

    // simplepeer generates signals which need to be sent across socket
    this.simplepeer.on("signal", (data) => {
      console.log("emitting simplepeer signal");
      this.socket.emit("fpjSignal", this.socket_id, this.socket.id, data);
    });

    // When we have a connection, send our stream
    this.simplepeer.on("connect", () => {
      console.log("CONNECTED to Peer");
      console.log(this.simplepeer);

      // Let's give them our stream
      this.simplepeer.addStream(stream);
      console.log("Send our stream");
    });

    // Stream coming in to us
    this.simplepeer.on("stream", (stream) => {
      console.log("Incoming Stream");
      let ghostyAudio = document.createElement("AUDIO");
      ghostyAudio.id = this.socket_id;
      ghostyAudio.srcObject = stream;
      ghostyAudio.muted = true;
      ghostyAudio.onloadedmetadata = function (e) {
        ghostyAudio.play();
      };
      document.body.appendChild(ghostyAudio);
      console.log(ghostyAudio);
    });

    this.simplepeer.on("close", () => {
      console.log("Got close event");
      // 
      // remove audio element
    });

    this.simplepeer.on("error", (err) => {
      console.log(err);
    });
  }

  inputsignal(sig) {
    this.simplepeer.signal(sig);
  }
}
