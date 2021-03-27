import json
from utils.aws_methods import get_response, send_update_wsapi, sendtoQueue
from utils.database import TicTacToeDB

apiUrl = "https://psmhp2yn01.execute-api.us-east-1.amazonaws.com/dev"
queueUrl = 'https://sqs.us-east-1.amazonaws.com/615551906171/Tictactoe_Queue'
db = TicTacToeDB("mongodb+srv://tictactoedb:fa6PQ1Xy8CCRoUou@cluster0.hb7sg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", "tictactoe_db")

def tictactoe_handleConnections(event, context):
    action = event.get("action")
    if action is not None:
        userID = event.get("userID")
        if action == "CONNECT":
            username = event.get("username")
            sendtoQueue(queueUrl, {"playerID":userID, "username":username})
            return get_response(200, "connecting")
        elif action == "DISCONNECT":
            is_player = db.user_isPlayer(userID)
            user = db.get_user(userID)
            db.remove_user(userID)
            users = db.get_allUsers()
            if is_player is not False:
                db.reset_game()
                send_update_wsapi(apiUrl, users, {"action":"PLAYER_DISCONNECT", "response_data": {"player":user}})
            else:
                send_update_wsapi(apiUrl, users, {"action":"SPECTATOR_DISCONNECT", "response_data": {"spectator":user.get("username")}})
            return get_response(200, "disconected")
        else:
            return get_response(500, "Something went wrong!")
    else:
        body = json.loads(event.get("body"))
        userID = event["requestContext"].get("connectionId")
        username = body.get("username")
        sendtoQueue(queueUrl, {"playerID":userID, "username":username})
        return get_response(200, "connecting")
        