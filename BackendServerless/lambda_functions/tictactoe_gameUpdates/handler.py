import json
import boto3
from utils.database import TicTacToeDB

apiUrl = "https://psmhp2yn01.execute-api.us-east-1.amazonaws.com/dev"
client = boto3.client("apigatewaymanagementapi", endpoint_url=apiUrl)
db = TicTacToeDB("mongodb+srv://tictactoedb:fa6PQ1Xy8CCRoUou@cluster0.hb7sg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", "tictactoe_db")

def _get_response(statusCode: int, message: object):
    return {
        "statusCode": statusCode,
        "body": json.dumps(message)
    }

def send_update(users:list, message:object):
    for user in users:
        try:
            id= user.get("_id") 
            client.post_to_connection(ConnectionId=id, Data=json.dumps(message))
        except:
            pass

def checkWinningLine (line:list):
    return line[0] != '' and (line[0] == line[1]) and (line[1] == line[2])

def checkFilledRow (row:list):
    return row[0] != '' and row[1] != '' and row[2] != ''

def checkWinner(board: list):
    check_values = [ board[0], board[1], board[2], [board[0][0], board[1][0], board[2][0]], [board[0][1], board[1][1], board[2][1]],
        [board[0][2], board[1][2], board[2][2]], [board[0][0], board[1][1], board[2][2]], [board[0][2], board[1][1], board[2][0]] ]
    for to_check in check_values:
        checked = checkWinningLine(to_check)
        if checked:
            return True
    return False

def checkDraw(board: list):
    return checkFilledRow(board[0]) and checkFilledRow(board[1]) and checkFilledRow(board[2])

def game_update(event, context):
    body = json.loads(event.get("body"))
    row = int(body.get("row"))
    column = int(body.get("column"))
    token = body.get("token")
    if token == db.get_gameStatus().get("turn"):
        game_status = db.update_board(row, column)
        board = game_status.get("board")
        if checkWinner(board):
            action = "RESULT_WIN"
            db.reset_game()
        elif checkDraw(board):
            action = "RESULT_DRAW"
            db.reset_game()
        else:
            action = "CHANGE_TURN" 
        users = db.get_allUsers()
        send_update(users, {"action":action, "response_data":game_status})
        return _get_response(200, "updated")
    else:
         return _get_response(400, "It's not your turn")
