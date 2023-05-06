// this file contains components for other class projects, not all are used in this app
// please refer to sections marked FPJ

// We need the file system here
var fs = require('fs');

// for live web
				
// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));

// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
  res.send('please use the url with the project you want to find :)')
});

// Here is the actual HTTP server 
// In this case, HTTPS (secure) server
var https = require('https');

// Security options - key and certificate
var options = {
  key: fs.readFileSync('privkey1.pem'),
  cert: fs.readFileSync('cert1.pem')
};

// We pass in the Express object and the options object
var httpServer = https.createServer(options, app);

// Default HTTPS port
httpServer.listen(443);

// WebSocket Portion
// WebSockets work with the HTTP server
const { Server } = require('socket.io');
const io = new Server(httpServer, {});

//var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);

	
		// When this user "send" from clientside javascript, we get a "message"
		// client side: socket.send("the message");  or socket.emit('message', "the message");
		socket.on('message', 
			// Run this function when a message is sent
			function (data) {
				console.log("message: " + data);
							
				// To all clients
				io.sockets.emit('message', data);
			}
		);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('otherevent', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'otherevent' " + data);
		});
		
		// for wk2
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('chatmessage', function(data) {
			// Data comes in as whatever was sent, including objects
			console.log("Received: 'chatmessage' " + data);
			
			// Send it to all of the clients
			io.emit('chatmessage', data);
		});

		// for wk3
		socket.on('w3mouse', function(data) {
			// io.emit("mouse", data);
			// console.log("mouse moved serverside");
			var dataPlusId = {
				x: data.x,
				y: data.y,
				handId: socket.id
			}
			// console.log(dataPlusId);
			socket.broadcast.emit('w3mouse', dataPlusId);
			// io.emit('w3mouse', dataPlusId);
		  });
    
		// for FPJ

		// saves Hosty's ID
		socket.on('fpjHostyConnect', function() {
			if (fpjHostyID == "") {
				fpjHostyID = socket.id;
				fpjHostySocket = socket;
				console.log("fpj: Josh connected with socket.id: " + fpjHostyID);
			} else {
				console.log("fpj: Josh already connected, connection attempt rejected");
				socket.emit('fpjHostyDoubleUp');
			}
		});

		socket.on('fpjHostyPing', function() {
			io.emit('fpjYesHosty');
		})

		socket.on('fpjGhostyCheck', function() {
			if (fpjGhostyID != "") {
				let dataToSend = {
					id: fpjGhostyID,
					ghostName: fpjGhostyName
				}
				socket.emit('fpjGhostyConnect', dataToSend);
			} else {
				console.log('no ghosty available');
			}
		});

		// check for active ghosty
		socket.on('fpjHostyGhostyCheck', function() {
			if (fpjHostyID == "") {
				socket.emit('fpjNoHosty');
			} else if (fpjGhostyID != "") {
				socket.emit('fpjGhostyDoubleUp');
			}
		});

		// save ghosty's ID
		socket.on('fpjGhostyConnect', function(data) {
			if (fpjGhostyID == "") {
				fpjGhostyID = socket.id;
				fpjGhostySocket = socket;
				fpjGhostyName = data;
				console.log("fpj: Ghosty connected with socket.id: " + fpjHostyID);
				console.log("fpj: and name: "+ fpjGhostyName);
				// for ghosty
				socket.emit('fpjGhostyConnected', fpjHostyID);
				// for hosty
				let dataToSend = {
					id: socket.id,
					ghostName: data
				}
				io.emit('fpjGhostyConnect', dataToSend);
			} else {
				console.log("fpj: Ghosty already connected, connection attempt rejected");
				socket.emit('fpjGhostyDoubleUp'); //
			}
		});
		
		// keystroke handling
		socket.on('fpjKeystroke', function(data) {
			let dataToSend = "";
			switch (data) {
				case "KeyS":
					dataToSend = "Move backward";
					break;
				case "KeyW":
					dataToSend = "Move forward";
					break;
				case "KeyA":
					dataToSend = "Move left";
					break;
				case "KeyD":
					dataToSend = "Move right";
					break;
				case "ArrowDown":
					dataToSend = "Look down";
					break;
				case "ArrowUp":
					dataToSend = "Look up";
					break;
				case "ArrowLeft":
					dataToSend = "Look left";
					break;
				case "ArrowRight":
					dataToSend = "Look right";
					break;
				case "KeyJ":
					dataToSend = "Interact";
					break;
				case "KeyH":
					dataToSend = "Hold/Release item";
					break;
			}
			io.emit('fpjNewInstruction', dataToSend);
		});

		socket.on('fpjClearInstruction', function() {
			io.emit('fpjClearInstruction');
		});

		socket.on('fpjMuteToggle', function(isMuted) {
			fpjHostySocket.emit('fpjMuteToggle', isMuted);
		});

		// simple peer signalling
		socket.on('fpjSignal', (to, from, data) => {
			console.log("fpj SIGNAL", to, data);
			if (fpjGhostySocket.id == to) {
				console.log("Found Ghosty, sending signal");
				fpjGhostySocket.emit('fpjSignal', to, from, data);
			} else if (fpjHostySocket.id == to) {
				console.log("Found Hosty, sending signal");
				fpjHostySocket.emit('fpjSignal', to, from, data);
			} else {
				console.log("couldn't send signal ghosty or hosty :(")
			}
		});

		// disconnect
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
			io.emit('disconnected', socket.id);
			// if socket.id is Hosty, then empty HostyID string
			if (fpjHostyID == socket.id) {
				fpjHostyID = "";
				fpjHostySocket = null;
				console.log("fpj: Josh disconnected, fpjHostyID cleared");
				io.emit('fpjHostyDisconnect', socket.id);
			}
			// same for ghosty
			if (fpjGhostyID == socket.id) {
				fpjGhostyID = "";
				fpjGhostyName = "";
				fpjGhostySocket = null;
				console.log("fpj: Ghosty disconnected, fpjGhostyID and fpjGhostyName cleared");
				io.emit('fpjGhostyDisconnect', socket.id);
			}
		});

	}
);

// for FPJ
let fpjHostySocket;
let fpjHostyID = "";
let fpjGhostySocket;
let fpjGhostyID = "";
let fpjGhostyName = "";

// end FPJ
