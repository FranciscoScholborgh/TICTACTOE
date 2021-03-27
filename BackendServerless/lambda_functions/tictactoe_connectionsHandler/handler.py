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
    
def connect_event(userID:str, username:str):
    status = db.register_player(userID, username)
    users = db.get_allUsers()
    try:
        if status["ready_toplay"]:
            send_update(users, {"action":"START_GAME", "response_data": status})
        else:
            send_update(users, {"action":"WAITING_RIVAL", "response_data": status})
    except KeyError:
        status["spectator"] = username
        send_update(users, {"action":"SPECTATOR_JOIN", "response_data": status})
    return _get_response(200, "connected")

def send_update(users:list, message:object):
    for user in users:
        try:
            id= user.get("_id") 
            client.post_to_connection(ConnectionId=id, Data=json.dumps(message))
        except:
            pass

def tictactoe_handleConnections(event, context):
    action = event.get("action")
    if action is not None:
        userID = event.get("userID")
        if action == "CONNECT":
            username = event.get("username")
            return connect_event(userID, username)
        elif action == "DISCONNECT":
            is_player = db.user_isPlayer(userID)
            user = db.get_user(userID)
            db.remove_user(userID)
            users = db.get_allUsers()
            if is_player is not False:
                db.reset_game()
                send_update(users, {"action":"PLAYER_DISCONNECT", "response_data": {"player":user}})
            else:
                send_update(users, {"action":"SPECTATOR_DISCONNECT", 
                    "response_data": {"spectator":user.get("username")}})
            return _get_response(200, "disconected")
        else:
            return _get_response(500, "Something went wrong!")
    else:
        body = json.loads(event.get("body"))
        userID = event["requestContext"].get("connectionId")
        username = body.get("username")
        return connect_event(userID, username)
