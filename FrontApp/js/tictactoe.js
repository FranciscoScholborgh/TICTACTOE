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
        <h3 v-else style="text-align:center;padding-bottom: 21px">{{player1["username"]}}: O Waiting Player 2  </h3>
        <div class="status d-flex justify-content-center">
            <h5 v-if="status=='ongame'" style="text-align:center;padding-bottom: 21px">{{now}}</h5>
            <h5 v-else-if="status=='win'" style="text-align:center;padding-bottom: 21px">YOU WIN!</h5>
            <h5 v-else-if="status=='lose'" style="text-align:center;padding-bottom: 21px">YOU LOSE!</h5>
            <h5  v-else-if="status=='draw'" style="text-align:center;padding-bottom: 21px">DRAW!</h5>
            <h5 v-else style="text-align:center;padding-bottom: 21px"></h5>
        </div> 
        <div class="board_row" v-for="(row, row_index) in rows">
            <div class="board_column" v-for="(column, column_index) in row" v-on:click="tap" v-bind:data-row="row_index" v-bind:data-column="column_index">
                {{column}}
            </div>
        </div>
    </div>`,
    data: function() {
        return { rows: [ ['', '', ''], ['', '', ''], ['', '', ''] ], updater: new WebSocketHandler("wss://psmhp2yn01.execute-api.us-east-1.amazonaws.com/dev"), 
            username:'', player1:'', player2:'', now:'', turn: '', status: '', playing:false, token:''};
    },
    methods: {
        waiting_rival: function(parameters) {
            var game_status = parameters["game_status"]
            this.restart()
            this.player1 = game_status["player1"]
            this.playing = true
            this.token = 'O'
        },
        start_game: function(parameters){
            var game_status = parameters["game_status"]
            this.restart()
            this.player1 = game_status["player1"]
            this.player2 = game_status["player2"]
            this.status= game_status["status"]
            this.turn = game_status["turn"]
            this.now = (this.turn == 'X' ? `Waiting for ${this.player2}: X` : "It's your turn: O")
            this.playing = true
            if (this.token === '') {
                this.token = 'X'
            }
        },
        spectador_join: function(parameters) {
            var game_status = parameters["game_status"]
            if (this.status === '') {
                this.player1 = game_status["player1"]
                this.player2 = game_status["player2"]
                this.status= game_status["status"]
                this.turn = game_status["turn"]
                this.now = (this.turn == 'X' ? `Waiting for ${this.player2}: X` : "It's your turn: O")
                this.rows[0] = game_status["board_row1"]
                this.rows[1] = game_status["board_row2"]
                this.rows[2] = game_status["board_row3"]
            } else {
                console.log(`The spectator ${parameters["spectator"]} has joined`)
            } 
        }, 
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
        register: function() {
            if (this.username === ''){
                alert("Enter your username, please")
            } else {
                var functions_toexecute = {
                    "WAITING_RIVAL": this.waiting_rival,
                    "START_GAME" : this.start_game,
                    "SPECTATOR_JOIN" : this.spectador_join,
                    "PLAYER_DISCONNECT": this.user_disconnect,
                    "SPECTATOR_DISCONNECT": this.user_disconnect
                }
                this.updater.attach_functions(functions_toexecute)
                send = {"action":"register", "username":this.username}
                this.updater.send_message(JSON.stringify(send))
                $("#usernameModal").modal('toggle')                
            }
        },
        tap: function(e) {
            console.log(`status ${this.status}`)
            console.log(`token: ${this.token}`)
            console.log(`turn: ${this.turn}`)
            if (this.status == 'ongame' && e.target.innerText == '' && (this.token === this.turn) ) {
                let rows = this.rows;
                rows[e.target.attributes['data-row'].value][e.target.attributes['data-column'].value] = this.turn;
                this.rows = rows.slice(0);
                if (this.checkWinner()) {
                    this.status = (this.turn == 'X' ? 'lose' : 'win');
                } else if(this.checkDraw()){
                    this.status = 'draw';
                } else {
                    this.changeTurn();                   
                }
            }
        },
        changeTurn: function() {
            this.turn = (this.turn == 'X' ? 'O' : 'X'); 
            this.now = (this.turn == 'X' ? `Waiting for ${this.player2}: X` : "It's your turn: O"); 
        },
        checkWinner: function() {
            return ( this.checkValues(this.rows[0]) || this.checkValues(this.rows[1]) || this.checkValues(this.rows[2]) ||
                this.checkValues([this.rows[0][0], this.rows[1][0], this.rows[2][0]]) || this.checkValues([this.rows[0][1], this.rows[1][1], this.rows[2][1]]) ||
                this.checkValues([this.rows[0][2], this.rows[1][2], this.rows[2][2]]) || this.checkValues([this.rows[0][0], this.rows[1][1], this.rows[2][2]]) ||
                this.checkValues([this.rows[0][2], this.rows[1][1], this.rows[2][0]]) );
        },
        checkDraw: function(){
            return !this.finished &&
                (this.checkValuesPresent(this.rows[0]) && this.checkValuesPresent(this.rows[1]) && this.checkValuesPresent(this.rows[2]));
        },
        checkValues: function(values) {
            return (values[0] != '' && (values[0] === values[1]) && (values[1] === values[2]));
        },
        checkValuesPresent: function(values) {
            return (values[0] != '' && values[1] != '' && values[2] != '');
        },
        checkValuesMatch: function(values) {
            return (values[0] === values[1]) && (values[1] === values[2]);
        },
        restart: function() {
            this.rows = [ ['', '', ''], ['', '', ''], ['', '', ''] ];
            this.player1=''; this.player2=''; this.now='', this.turn= ''; this.status= ''; this.playing = false;
        },
    }
});
