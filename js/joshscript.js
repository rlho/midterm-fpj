var socket = io.connect();

var socketImgs = {};

socket.on('connect', function(){
    console.log("Connected");
});

// tell the server that josh is trying to connect
socket.emit('fpjJoshConnect');

//catch both cases
socket.on('joshIsAlreadyConnected', function() {
    document.getElementById('joshLiveView').style.display = 'none';
    document.getElementById('actionSelecttext').style.display = 'none';
    document.getElementById('suggestedTasks').style.display = 'none';
    
    document.getElementById('errorText').innerHTML = "sorry someone else is josh";
});

socket.on('youAreNowJosh', function() {
    setup();
});

function setup() {
    let cameraMonitor = document.getElementById('cameraMonitor');
    // let cameraMonitor = document.getElementsByTagName('video');
    console.log(cameraMonitor);
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment'
        }
      })
    .then(stream => cameraMonitor.srcObject = stream)
    .catch(console.error);

    // Canvas element on the page
    var thecanvas = document.getElementById('cameraCanvas');
    var thecontext = thecanvas.getContext('2d');

    var draw = function() {
    	// Draw the video onto the canvas
    	thecontext.drawImage(cameraMonitor,0,0,cameraMonitor.width,cameraMonitor.height);
    	setTimeout(draw,300);

        // Create a data URL from the canvas
        var dataUrl = thecanvas.toDataURL('image/webp', 1);
        // console.log(dataUrl);
        // Send it via our socket server the same way as we send the image
        socket.emit('fpj new frame', dataUrl);
    };

    draw();	

}

// window.addEventListener('load', setup());
// setup();





// // Create a data URL from the canvas
// var dataUrl = thecanvas.toDataURL('image/webp', 1);

// // Optionally draw it to an image object to make sure it works
// document.getElementById('imagefile').src = dataUrl;

// // Send it via our socket server the same way as we send the image
// socket.emit('image', dataUrl);