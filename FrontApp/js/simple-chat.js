app.component('simple-chat', {
    template: `
    <div style="min-width: 100%;width: 92%;" class="card">
        <div class="card-header">
            <span>Chat</span>
        </div>
        <div class="card-body">
            <div class="d-flex justify-content-start mb-4">
                <div class="msg_cotainer">
                    <div class="chat_username">User</div>
                    <div class="chat_message">Message</div>
                    <div class="chat_time">8:40 AM, Today</div>
                </div>
            </div>
            <div class="d-flex justify-content-end mb-4">
                <div class="msg_cotainer_send">
                    <div class="chat_username">User</div>
                    <div class="chat_message">Hi Khalid i am good tnx how about you at home?</div>
                    <div class="chat_time">8:55 AM, Today</div>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <div class="input-group">
                <input type="text" class="form-control input-sm chat_textbox" placeholder="Type your message here..." tabindex="0" dir="ltr" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" contenteditable="true" />
                <span class="input-group-btn">
                    <button class="btn btn-primary bt_bg btn-sm chat_textbox">Send</button>
                </span>
            </div>
        </div>
    </div>
    `
});
