app.component('simple-chat', { 
    template: `
    <div style="min-width: 100%;width: 92%;" class="card">
        <div class="card-header">
            <span>Chat</span>
        </div>
        <div class="card-body">
            <div class="d-flex justify-content-start mb-4" v-for="message in messages">
                <div class="msg_cotainer">
                    <div class="chat_username">{{message.username}}</div>
                    <div class="chat_message">{{message.message}}</div>
                    <div class="chat_time">{{message.time}}</div>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <div class="input-group">
                <input v-model="txt_msg" v-on:keyup.enter="send_message" type="text" class="form-control input-sm chat_textbox" placeholder="Type your message here..." tabindex="0" dir="ltr" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" contenteditable="true" />
                <span class="input-group-btn">
                    <button v-on:click="send_message" class="btn btn-primary bt_bg btn-sm chat_textbox">Send</button>
                </span>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return { updater: tictactoe_ws, messages: [], username: '', txt_msg: '', };
    },
    methods: {
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
    created: function() {
        var functions_toexecute = {
            "LOAD_CHAT": this.load_chat,
            "UPDATE_CHAT": this.recieve_message
        }
        this.updater.attach_functions(functions_toexecute)
    },
});
