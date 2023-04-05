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
		// save ID of Josh

		// force refresh for new connections
		socket.on('forceRefresh', function() {
			socket.emit('refreshTasks', taskList);
		})

		// receive task suggestions
		socket.on('newSuggestion', function(data) {
			console.log('fpj new suggestion received');
			taskList.push(data);
			io.emit('refreshTasks', taskList);
		});

		// clear tasks when task selected
		socket.on('clearTasks', function() {
			console.log('fpj tasks cleared');
			taskList = [];
			io.emit('refreshTasks', taskList);
		});

		// send task (string) when task selected
		socket.on('taskChosen', function(data) {
			console.log('fpj task chosen');
			io.emit('taskChosen', data);
		});

		// disconnect
		socket.on('disconnect', function() {
			console.log("Client has disconnected");
			io.emit('disconnected', socket.id);
		});

	}
);

// for FPJ
let fpjJoshID = "";
let fpjConnectedControllers = [];
let taskList = [];

// // for conndev
// const mqtt = require('mqtt')
// const client  = mqtt.connect('mqtt://test.mosquitto.org')
// const path = './public/conndev/itpee/log.json';
// const stream = fs.createWriteStream(path, {flags:'a'});

// client.on('connect', function () {
//   client.subscribe('conndev/joshjoshjosh', function (err) {
//     if (!err) {
//     //   client.publish('conndev/joshjoshjosh', 'server subscribed to conndev/joshjoshjosh')
//     }
//   })
// })

// client.on('message', function (topic, message) {
//   // message is Buffer
//   let toLogText = message.toString();
//   console.log(toLogText);
//   stream.write(toLogText + "\n");
// //   client.end()
// })

// client.on('error',(error) => {
//     console.error(error);
//     // process.exit(1);
// });