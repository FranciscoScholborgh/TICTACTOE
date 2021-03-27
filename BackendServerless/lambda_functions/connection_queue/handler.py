import json
import boto3
import logging
from botocore.exceptions import ClientError
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
        
def connect_event(userID:str, username:str):
    response = db.register_player(userID, username)
    users = db.get_allUsers()
    try:
        game_status = response.get("game_status")
        players = [game_status.get("player1")]
        if response["ready_toplay"]:
            players.append(game_status.get("player2"))
            send_update(players, {"action":"START_GAME", "response_data": response})
            player1_id = game_status.get("player1").get("_id")
            player2_id = game_status.get("player2").get("_id")
            spectators = []
            for user in users:
                user_id = user.get("_id")
                if user_id != player1_id and user_id != player2_id:
                    spectators.append(user)
            response[""] = True
            send_update(spectators, {"action":"SPECTATOR_JOIN", "response_data": response})
        else:
            send_update(players, {"action":"WAITING_RIVAL", "response_data": response})
    except KeyError:
        response["spectator"] = username
        send_update(users, {"action":"SPECTATOR_JOIN", "response_data": response})
    return _get_response(200, "connected")

def lambda_handler(event, context):
    records = event.get("Records")[0]
    body = json.loads(records.get("body")) 
    userID = body.get("playerID")
    username = body.get("username")
    return connect_event(userID, username)
    