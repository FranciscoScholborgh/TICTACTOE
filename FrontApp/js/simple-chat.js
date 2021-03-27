//chat component
app.component('simple-chat', { 
    template: `
    <div style="min-width: 100%;height: 100%;" class="card">
        <div style="background: #141E30;" class="card-header">
            <span>Chat</span>
        </div>
        <div class="card-body">
            <div style="height: 250px; overflow-y: scroll;scroll-behavior: smooth;">
                <div v-for="message in messages">
                    <div v-if="message.author" class="msg_cotainer">
                        <div class="chat_username">{{message.username}}</div>
                        <div class="chat_message">{{message.message}}</div>
                        <div class="chat_time">{{message.time}}</div>
                    </div>
                    <div v-else class="msg_cotainer">
                        <div class="chat_username">{{message.username}}</div>
                        <div class="chat_message">{{message.message}}</div>
                        <div class="chat_time">{{message.time}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <div class="input-group">
                <input v-model="txt_msg" v-on:keyup.enter="send_message" type="text" class="form-control input-sm chat_textbox" placeholder="Type your message here..." tabindex="0" dir="ltr" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" contenteditable="true" />
                <span class="input-group-btn">
                    <button v-on:click="send_message" class="button chat_textbox">Send</button>
                </span>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return { updater: tictactoe_ws, messages: [], username: '', txt_msg: '', };
    },
    methods: {
        //send a request to recieve from a lambda function all the chat records
        load_chat: function() {
            var send = {"action":"chat", "request":"LOAD_CHAT"}
            this.updater.send_message(JSON.stringify(send))
        },
        // parameters => Json with data from a lambda function response that updates the game
        recieve_message: function(message) {
            var time = new Date(message["time"])
            message["time"] = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            this.messages.push(message)
        },
        // this function capture an input value and send the message to a lambda function to notify the others players and spectators
        send_message: function() {
            this.username = $("#username").val()
            if(this.txt_msg !== '') {
                var time = new Date().toUTCString();
                var msg_tosend = {"action":"chat", "request":"SEND_MESSAGE", "username":this.username, "message":this.txt_msg, "time":time}
                this.updater.send_message(JSON.stringify(msg_tosend))
                this.txt_msg = ''
            } 
        }
    },
    // send to the websocket class a Json with the command and function to be execute when a lambda function updates de chat
    created: function() {
        var functions_toexecute = {
            "LOAD_CHAT": this.load_chat,
            "UPDATE_CHAT": this.recieve_message
        }
        this.updater.attach_functions(functions_toexecute)
    },
});
