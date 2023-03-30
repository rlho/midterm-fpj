// sketch things
var p5canv;
var isOccupied = false;

// socket.io things
var socket = io.connect();

socket.on('connect', function(){
    console.log("Connected");
});

// tell the server that josh is trying to connect
socket.emit('fpjJoshConnect');

//catch both connection cases
socket.on('joshIsAlreadyConnected', function() {
    document.getElementById('videoDiv').style.display = 'none';
    document.getElementById('actionCompleteButton').style.display = 'none';
    document.getElementById('suggestedTasks').style.display = 'none';
    
    document.getElementById('taskText').innerHTML = "sorry someone else is josh, please try again later";
    
    isOccupied = true;
    
    return;
});
// socket.on('youAreNowJosh', function() {
//     setup();
// });

socket.on('new submission', function(data) {
    // add new subs to list, greyed out if task in action currently
    let actionList = document.getElementById('suggestedTasks');
    // document.createElement
});




function setup() {
    if (!isOccupied) {
        // Canvas element on the page
        var videoDiv = document.getElementById('videoDiv');
        // var context = thecanvas.getContext('2d');

        p5canv = createCanvas(640, 480);
        p5canv.parent(videoDiv);
        var constraints = {
            audio: false,
            video: {
            facingMode: {
                exact: "environment"
            }
            }    
            //video: {
            //facingMode: "user"
            //} 
        };
        capture = createCapture(constraints);
        
        capture.hide();
    }  else {
        console.log("josh is occupied");
    }
}

function draw() {
    if (!isOccupied) {
        image(capture, 0, 0);

        // // Create a data URL from the canvas
        // console.log(p5canv.canvas);
        // var dataUrl = p5canv.toDataURL('image/webp', 1);
        var dataUrl = p5canv.canvas.toDataURL();
        

        // // Optionally draw it to an image object to make sure it works
        // document.getElementById('imagefile').src = dataUrl;

        // // Send it via our socket server the same way as we send the image
        // console.log(dataUrl);
        socket.emit('josh frame', dataUrl);

        setTimeout(draw,300);
    }
}

function taskSelected() {
    console.log('task selected');
    // send selected task as a string to server then controllers
    // and change current task to this task
    socket.emit('josh has picked a task',    );

    // clear client list of tasks (change colour and make unclickable)



}

function fpjTaskComplete() {
    console.log('task completed');
    // activate new list of actions (change colour and make clickable)
    
}

