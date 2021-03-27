import json
from utils.aws_methods import get_response, send_update_wsapi
from utils.database import TicTacToeDB

apiUrl = "https://psmhp2yn01.execute-api.us-east-1.amazonaws.com/dev"
db = TicTacToeDB("mongodb+srv://tictactoedb:fa6PQ1Xy8CCRoUou@cluster0.hb7sg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", "tictactoe_db")

#:param userID: String user identification in the database collections of users
#:param username: String name of a users
#:return: returns dir with the code state of the response (int) and a message with game status and players and spectator access         
def connect_event(userID:str, username:str):
    response = db.register_player(userID, username)
    users = db.get_allUsers()
    try:
        game_status = response.get("game_status")
        players = [game_status.get("player1")]
        if response["ready_toplay"]:
            players.append(game_status.get("player2"))
            send_update_wsapi(apiUrl, players, {"action":"START_GAME", "response_data": response})
            player1_id = game_status.get("player1").get("_id")
            player2_id = game_status.get("player2").get("_id")
            spectators = []
            for user in users:
                user_id = user.get("_id")
                if user_id != player1_id and user_id != player2_id:
                    spectators.append(user)
            response[""] = True
            send_update_wsapi(apiUrl, spectators, {"action":"SPECTATOR_JOIN", "response_data": response})
        else:
            send_update_wsapi(apiUrl, players, {"action":"WAITING_RIVAL", "response_data": response})
    except KeyError:
        response["spectator"] = username
        send_update_wsapi(apiUrl, users, {"action":"SPECTATOR_JOIN", "response_data": response})
    return get_response(200, "connected")

def connection_queue(event, context):
    records = event.get("Records")[0]
    body = json.loads(records.get("body")) 
    userID = body.get("playerID")
    username = body.get("username")
    return connect_event(userID, username)
    