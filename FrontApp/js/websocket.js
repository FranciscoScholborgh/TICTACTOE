//Define the class to handle the websocket conection 
class WebSocketHandler {
    // url => string url of the websocket connection 
    //exectuables => Json with commands as keys and functions as values to be executed when the socket recieve a message
    constructor(url, executables) {
        this.socket = new WebSocket(url);
        this.execute_functions = executables

        this.socket.onopen = function() {
            console.log("[open] Connection established");
        };
        
        // event => response from websocoket close event
        this.socket.onclose = function(event) {
            console.log("went on close")
            if (event.wasClean) {
                alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                alert('[close] Connection died');
            }
        };
        
        // event => response from websocoket error event
        this.socket.onerror = function(error) {
            alert(`[error] ${error.message}`);
        };
    }

    get attached_functions() {
        return this.execute_functions
    }

    // execute_functions => Json with functions references to be execute on incoming message
    attach_functions(executables) {
        var run_functions = this.execute_functions
        Object.keys(run_functions).forEach(function(function_name) {
            var to_execute = run_functions[function_name];
            executables[function_name]= to_execute
        });
        this.execute_functions = executables
        this.socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            var action = data["action"]
            try {
                executables[action](data["response_data"])
            } catch(TypeError) {
                
            }           
        };
    }

    // message => Json object to be send 
    send_message(message) {
        this.socket.send(message)
    } 
}

//define as a global variable the websocket to be used and allow the vue components to load their commads and functions to be exectued
var tictactoe_ws = new WebSocketHandler("wss://psmhp2yn01.execute-api.us-east-1.amazonaws.com/dev", {})