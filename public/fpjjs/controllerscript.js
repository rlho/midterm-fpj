var socket = io.connect();

var socketImgs = {};

socket.on('connect', function(){
    console.log("Connected");
});



function sendSuggestion() {
    let suggestionText = document.getElementById('controllerSubText').value;

    // console.log(suggestionText);

    socket.emit()

    document.getElementById('controllerSubText').value = '';
}



// socket.on('fpjJoshDisconnected', function() {
//     console.log("josh has disconnected");
//     fpjJoshID = "";
//     io.emit('fpjJoshDisconnected');
// });

// socket.on('task selected', function(data) {
//     console.log('Josh picked: '+data);
//     io.emit('josh has picked', data);
//     taskList = [];
// });

// socket.on('task completed', function(data) {
//     console.log('task completed by Josh');
//     io.emit('task completed');
// });

// socket.on('fpj new frame', function(data) {
//     io.emit('new josh frame', data);
// });