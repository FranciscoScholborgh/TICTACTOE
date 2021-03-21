//Define tictactoe component
app.component('tictactoe', {
    template: `
    <div>
        <h3 style="text-align:center;padding-bottom: 21px">{{player1}}: O  VS {{player2}}: X  </h3>
        <div class="status">
            <h5 v-if="result=='ongame'" style="text-align:center;padding-bottom: 21px">{{now}}</h5>
            <h5 v-else-if="result=='win'" style="text-align:center;padding-bottom: 21px">YOU WIN!</h5>
            <h5 v-else-if="result=='lose'" style="text-align:center;padding-bottom: 21px">YOU LOSE!</h5>
            <h5 v-else style="text-align:center;padding-bottom: 21px">DRAW!</h5>
        </div> 
        <div class="board_row" v-for="(row, row_index) in rows">
            <div class="board_column" v-for="(column, column_index) in row" v-on:click="tap" v-bind:data-row="row_index" v-bind:data-column="column_index">
                {{column}}
            </div>
        </div>
    </div>`,
    data: function() {
        return {
            rows: [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ],
            player1:'player1',
            player2:'player2',
            now:"It's your turn: O",
            turn: 'O',
            result: 'ongame',
        };
    }, methods: {
        tap: function(e) {
            if (this.result == 'ongame' && e.target.innerText == '') {
                let rows = this.rows;
                rows[e.target.attributes['data-row'].value][e.target.attributes['data-column'].value] = this.turn;
                this.rows = rows.slice(0);
                if (this.checkWinner()) {
                    this.result = (this.turn == 'X' ? 'lose' : 'win');
                } else if(this.checkDraw()){
                    this.result = 'draw';
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
            return (
            this.checkValues(this.rows[0]) ||
            this.checkValues(this.rows[1]) ||
            this.checkValues(this.rows[2]) ||
            this.checkValues([this.rows[0][0], this.rows[1][0], this.rows[2][0]]) ||
            this.checkValues([this.rows[0][1], this.rows[1][1], this.rows[2][1]]) ||
            this.checkValues([this.rows[0][2], this.rows[1][2], this.rows[2][2]]) ||
            this.checkValues([this.rows[0][0], this.rows[1][1], this.rows[2][2]]) ||
            this.checkValues([this.rows[0][2], this.rows[1][1], this.rows[2][0]]));
        },
        checkDraw: function(){
            return !this.finished &&
            (this.checkValuesPresent(this.rows[0]) &&
            this.checkValuesPresent(this.rows[1]) &&
            this.checkValuesPresent(this.rows[2]));
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
        restart: function(e) {
            this.rows = [
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ];
            this.finished = false;
            this.nextPlayer();
        },
    }
});
