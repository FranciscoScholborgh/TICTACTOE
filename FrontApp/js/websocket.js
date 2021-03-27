
class WebSocketHandler {
    // url => string url of the websocket connection 
    constructor(url) {
        this.socket = new WebSocket(url);

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
    attach_functions(execute_functions) {
        this.socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            var action = data["action"]
            try {
                execute_functions[action](data["response_data"])
            } catch(TypeError) {
                
            }           
        };
    }

    // message => Json object to be send 
    send_message(message) {
        this.socket.send(message)
    } 
}