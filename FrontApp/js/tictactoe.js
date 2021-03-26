//Define tictactoe component  
app.component('tictactoe', {
    template: `
    <div class="modal fade" id="usernameModal" tabindex="-1" role="dialog" aria-labelledby="modal_label" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal_label">Enter your username</h5>
                </div>
                <div class="modal-body">
                    <input v-model="username" placeholder="username" v-on:keyup.enter="register" style="width: 100%">
                </div>
                <div class="modal-footer">
                    <button v-on:click="register" type="button" class="btn btn-primary">Save</button>
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
            <div class="board_column" v-for="(column, column_index) in row" v-on:click="tap" v-bind:data-row="row_index" v-bind:data-column="column_index">
                {{column}}
            </div>
        </div>
    </div>`,
    data: function() {
        return { board: [ ['', '', ''], ['', '', ''], ['', '', ''] ], updater: new WebSocketHandler("wss://psmhp2yn01.execute-api.us-east-1.amazonaws.com/dev"), 
            username:'', player1:'', player2:'', now:'', turn: '', status: '', playing:false, token:''};
    },
    methods: {
        // parameters => Json with data from a lambda function response from players connection
        waiting_rival: function(parameters) {
            var game_status = parameters["game_status"]
            this.restart()
            this.player1 = game_status["player1"]
            this.playing = true
            this.token = 'O'
        },
        // parameters => Json with data from a lamdba function response from players connection
        start_game: function(parameters){
            var game_status = parameters["game_status"]
            this.restart()
            this.player1 = game_status["player1"]
            this.player2 = game_status["player2"]
            this.status= game_status["status"]
            this.turn = game_status["turn"]
            this.playing = true
            if (this.token === '') {
                this.token = 'X'
            }
            this.now = (this.turn != this.token ? `Waiting for ${( this.turn === 'O' ? this.player1["username"] : this.player2["username"] )}` : "It's your turn")
        },
        // parameters => Json with data from a lambda function response from spectatores connection
        spectador_join: function(parameters) {
            var game_status = parameters["game_status"]
            if (this.status === '') {
                this.player1 = game_status["player1"]
                this.player2 = game_status["player2"]
                this.status= game_status["status"]
                this.turn = game_status["turn"]
                this.now = `Waiting for ${( this.turn == 'O' ? this.player1["username"] : this.player2["username"] )}`
                this.board = game_status["board"]
            } else {
                console.log(`The spectator ${parameters["spectator"]} has joined`)
            } 
        }, 
        // parameters => Json with data from a lambda function response players and spectatores disconnection
        user_disconnect: function(parameters) {
            var message = ''
            if( 'player' in parameters) {
                var user_id = parameters["player"]["_id"]
                if(this.playing) {
                    message = "You won!"
                } else {
                    if(user_id === this.player1["_id"]) {
                        message = `Player ${this.player1["username"]} has disconneted, Player ${this.player2["username"]} wins`
                    } else {
                        message = `Player ${this.player2["username"]} has disconneted, Player ${this.player1["username"]} wins`
                    }
                }
            } else {
                var spectator = parameters["spectator"]
                message = `The spectator ${spectator} has disconneted`
            }
            console.log(message)
        },
        changeTurn: function(parameters) {
            this.board = parameters["board"]
            this.turn = parameters["turn"]
            if(this.playing) {
                this.now = (this.turn != this.token ? `Waiting for ${( this.turn === 'O' ? this.player1["username"] : this.player2["username"] )}` : "It's your turn")
            } else {
                this.now = `Waiting for ${( this.turn === 'O' ? this.player1["username"] : this.player2["username"] )}`
            }
        },
        result_draw: function(parameters) {
            this.board = parameters["board"]
            this.status = 'draw'
            alert("Prepare to play")
        },
        check_winner: function(parameters) {
            this.board = parameters["board"]
            this.status = (this.playing ? (this.turn == this.token ? 'win' : 'lose') : 'spectator')
        },
        register: function() {
            if (this.username === ''){
                alert("Enter your username, please")
            } else {
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
                send = {"action":"register", "username":this.username}
                this.updater.send_message(JSON.stringify(send))
                $("#usernameModal").modal('toggle')                
            }
        },
        tap: function(e) {
            if (this.status == 'ongame' && e.target.innerText == '' && (this.token === this.turn) ) {
                var row = e.target.attributes['data-row'].value
                var column = e.target.attributes['data-column'].value
                send = {"action":"gameUpdate", "row":row, "column":column, "token":this.token}
                this.updater.send_message(JSON.stringify(send))
            }
        },
        restart: function() {
            this.board = [ ['', '', ''], ['', '', ''], ['', '', ''] ];
            this.player1=''; this.player2=''; this.now='', this.turn= ''; this.status= ''; this.playing = false;
        },
    }
});
