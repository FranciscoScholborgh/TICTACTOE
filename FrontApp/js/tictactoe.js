//Define tictactoe component  
app.component('tictactoe', {
    template: `
    <div class="modal fade" id="usernameModal" tabindex="-1" role="dialog" aria-labelledby="modal_label" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" >
            <div class="modal-content">
                <div style="background: #141E30;" class="modal-header">
                    <h5 class="modal-title" id="modal_label">Enter your username</h5>
                </div>
                <div class="modal-body input-group">
                    <input v-model="username" placeholder="username" v-on:keyup.enter="register" style="width: 100%" type="text" class="form-control input-sm chat_textbox" tabindex="0" dir="ltr" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" contenteditable="true"/>
                </div>
                <div class="modal-footer">
                    <button v-on:click="register" type="button" class="button">Save</button>
                </div>
            </div>
        </div>
    </div>
    <div>
        <h3 v-if="status=='ongame'" style="text-align:center;padding-bottom: 21px">{{player1["username"]}}: O  VS {{player2["username"]}}: X  </h3>
        <h3 v-else style="text-align:center;padding-bottom: 21px">Waiting player</h3>
        <div class="status d-flex justify-content-center">
            <h5 v-if="status=='ongame'" style="text-align:center;padding-bottom: 21px">{{now}}</h5>
            <h5 v-else-if="status=='win'" style="text-align:center;padding-bottom: 21px">YOU WIN!</h5>
            <h5 v-else-if="status=='lose'" style="text-align:center;padding-bottom: 21px">YOU LOSE!</h5>
            <h5 v-else-if="status=='spectator'" style="text-align:center;padding-bottom: 21px">Player {{(turn == 'O' ? player1["username"] : player2["username"])}} wins</h5>
            <h5  v-else-if="status=='draw'" style="text-align:center;padding-bottom: 21px">DRAW!</h5>
            <h5 v-else style="text-align:center;padding-bottom: 21px"></h5>
        </div>
        <div class="board_row" v-for="(row, row_index) in board">
            <div class="cell board_column" v-for="(column, column_index) in row" v-on:click="tap" v-bind:data-row="row_index" v-bind:data-column="column_index">
                {{column}}
            </div>
        </div>
    </div>`,
    data: function() {
        return { board: [ ['', '', ''], ['', '', ''], ['', '', ''] ], updater: tictactoe_ws, username:'', player1:'', player2:'', now:'', turn: '', status: '', token:''};
    },
    methods: {
        // return str to update the player who is expected to make his move
        waiting_labelMsg: function () {
            var msg = `Waiting for ${( this.turn === 'O' ? this.player1["username"] : this.player2["username"] )}`
            return msg
        },
        // param game_status is a Json with the tictactoe game info
        // pram is_player is a boolean value to verify if a token must be assignend to a player 
        //updates de board and status of the tic tac toe game
        load_gameBoard: function(game_status, is_player) {
            this.status= game_status["status"]
            this.turn = game_status["turn"]
            this.board = game_status["board"]
            this.player1 = game_status["player1"]
            this.player2 = game_status["player2"]
            if (is_player) {
                if(this.token === '') {
                    this.token = (this.player2 === null ? 'O' : 'X' )
                }
                if (game_status["new_game"] === true){
                    toastr.success("You're playing now")
                }
            } else {
                this.now = `Waiting for ${( this.turn == 'O' ? this.player1["username"] : this.player2["username"] )}`
            }            
        },
        // parameters => Json with data from a lambda function response from players connection
        waiting_rival: function(parameters) {
            var game_status = parameters["game_status"]
            this.load_gameBoard(game_status, true)
        },
        // parameters => Json with data from a lamdba function response from players connection
        start_game: function(parameters){
            $(document).unbind("click");
            var game_status = parameters["game_status"]
            this.load_gameBoard(game_status, true)
            this.now = (this.turn != this.token ? this.waiting_labelMsg() : "It's your turn")          
        },
        // parameters => Json with data from a lambda function response from spectatores connection
        spectador_join: function(parameters) {
            $(document).unbind("click");
            var game_status = parameters["game_status"]
            if (game_status["new_game"] === true) {
                this.load_gameBoard(game_status, false)
                toastr.info("The other players clicked faster, you've joined as a spectator")
            } else if (this.status === '') {
                this.load_gameBoard(game_status, false)
                toastr.info("You've joined as a spectator")
            }
            else {
                toastr.info(`The spectator ${parameters["spectator"]} has joined`)
            }  
        }, 
        // parameters => Json with data from a lambda function response players and spectatores disconnection
        user_disconnect: function(parameters) {
            var message = ''
            if( 'player' in parameters) {
                is_player = (this.token != '')
                this.status = (is_player ? 'win' : 'spectator' )
                if(is_player) {
                    message = "You won!"
                    toastr.success('Rival disconnected, You won!, if you want to play again click fast to match with other player')
                } else {
                    if(parameters["player"]["_id"] === this.player1["_id"]) {
                        message = `Player ${this.player1["username"]} has disconneted, Player ${this.player2["username"]} wins`
                    } else {
                        message = `Player ${this.player2["username"]} has disconneted, Player ${this.player1["username"]} wins`
                    }
                    toastr.info(message)
                }
                this.click_toplay()
            } else {
                message = `The spectator ${parameters["spectator"]} has disconneted`
                toastr.info(message)
            }
        },
         // parameters => Json with data from a lambda function response that updates the game
        changeTurn: function(parameters) {
            this.board = parameters["board"]
            this.turn = parameters["turn"]
            if(this.token != '') {
                this.now = (this.turn != this.token ? this.waiting_labelMsg() : "It's your turn")
            } else {
                this.now = this.waiting_labelMsg()
            }
        },
         // parameters => Json with data from a lambda function response that notify a tie
        result_draw: function(parameters) {
            this.board = parameters["board"]
            this.status = 'draw'
            toastr.info("It's a draw!, if you want to play click fast to match with other player")
            this.click_toplay() //prepare to play
        },
        // parameters => Json with data from a lambda function response that notify the winner
        check_winner: function(parameters) {
            this.board = parameters["board"]
            this.status = (this.token != '' ? (this.turn == this.token ? 'win' : 'lose') : 'spectator')
            if(this.status == 'win'){
                toastr.success('You won!, if you want to play again click fast to match with other player')
            } else if(this.status == 'lose'){
                toastr.error('You lose!, if you want to play again click fast to match with other player')
            } else {
                toastr.info(`Player ${(this.turn == 'O' ? player1["username"] : player2["username"])} wins, if you want to play again click fast to match with other player`)
            }
            this.click_toplay() //prepare to play
        },
        // check if the user has input a username and then 
        // send to the websocket class a Json with the command and function to be execute when a lambda function updates the tic tac toe game status
        register: function() {
            if (this.username === ''){
                alert("Enter your username, please")
            } else {
                $("#username").val(this.username) 
                var functions_toexecute = {
                    "WAITING_RIVAL": this.waiting_rival,
                    "START_GAME" : this.start_game,
                    "SPECTATOR_JOIN" : this.spectador_join,
                    "PLAYER_DISCONNECT": this.user_disconnect,
                    "SPECTATOR_DISCONNECT": this.user_disconnect,
                    "CHANGE_TURN": this.changeTurn,
                    "RESULT_DRAW": this.result_draw,
                    "RESULT_WIN": this.check_winner
                }
                this.updater.attach_functions(functions_toexecute)
                var send = {"action":"register", "username":this.username}
                this.updater.send_message(JSON.stringify(send))
                $("#usernameModal").modal('toggle')                
            }
        },
        //detects when a player or spectator touch a cell of the tic tac toe board
        //if it's a player and is his turn updates a lambda function that notify the other player and spectators
        tap: function(e) {
            if (this.status == 'ongame' && e.target.innerText == '' && (this.token === this.turn) ) {
                var row = e.target.attributes['data-row'].value
                var column = e.target.attributes['data-column'].value
                var send = {"action":"gameUpdate", "row":row, "column":column, "token":this.token}
                this.updater.send_message(JSON.stringify(send))
            }
        },
        //clear the tic tac toe game satus
        restart: function() {
            this.board = [ ['', '', ''], ['', '', ''], ['', '', ''] ];
            this.player1=''; this.player2=''; this.now='', this.turn= ''; this.status= '';
        },
        //unbinds the two fastest click event and send a request to a lambda function to determine if the user it's a player or join as an spectator
        new_game: function() {
            this.restart()
            $(document).unbind("click");
            var send = {"action":"register", "username":this.username}
            this.updater.send_message(JSON.stringify(send))
        //binds to the screen the functions that allow the two fastest click to be the new players
        }, click_toplay: function() {
            this.token='';
            $(document).click(this.new_game)
        }
    }
});
