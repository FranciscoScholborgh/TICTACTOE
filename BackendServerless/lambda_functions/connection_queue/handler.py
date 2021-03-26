
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

def connection_queue(event, context):
    records = event.get("Records")[0]
    body = json.loads(records.get("body")) 
    userID = body.get("playerID")
    username = body.get("username")
    return connect_event(userID, username)