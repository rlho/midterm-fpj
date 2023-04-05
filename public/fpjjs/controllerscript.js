var socket = io.connect();

socket.on('connect', function(){
    console.log("Connected");
    socket.emit('forceRefresh');
});

function sendSuggestion() {
    let inputField = document.getElementById('controllerSubText')
    let suggestionText = inputField.value;

    // console.log(suggestionText);

    socket.emit('newSuggestion', suggestionText);

    inputField.value = '';
}

socket.on('refreshTasks', function(data) {
    let taskList = document.getElementById("suggestedTasks");
    while (taskList.hasChildNodes()) {
        taskList.removeChild(taskList.firstChild);
    };
    data.forEach(element => {
        let task = document.createElement("div");
        task.setAttribute("class", "task");
        task.innerHTML = element;
        taskList.appendChild(task);
    });
    console.log('list of suggestions refreshed');
});


socket.on('taskChosen', function(data) {
    let taskText = document.getElementById("taskText");
    taskText.innerHTML = data;
});

// https://www.w3schools.com/howto/howto_js_trigger_button_enter.asp
// Get the input field
var input = document.getElementById("controllerSubText");

// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("controllerSubButton").click();
    }
});