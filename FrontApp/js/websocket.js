
class WebSocketHandler {
    constructor(url) {
        this.socket = new WebSocket(url);

        this.socket.onopen = function() {
            console.log("[open] Connection established");
        };
        
        this.socket.onclose = function(event) {
            console.log("went on close")
            if (event.wasClean) {
                alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                alert('[close] Connection died');
            }
        };

        this.socket.onerror = function(error) {
            alert(`[error] ${error.message}`);
        };
    }

    get attached_functions() {
        return this.execute_functions
    }

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

    send_message(message) {
        this.socket.send(message)
    } 
}