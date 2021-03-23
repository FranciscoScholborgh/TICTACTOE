import json
from utils.database import TicTacToeDB

db = TicTacToeDB()

def _get_response(statusCode: int, message: object):
    return {
        "statusCode": statusCode,
        "body": json.dumps(message)
    }

def connection_manager(event, context):

    connectionIP = event["requestContext"].get("identity").get("sourceIp")       
    if event["requestContext"]["eventType"] == "CONNECT":
        username = event["queryStringParameters"].get("username")
        status = db.register_player(connectionIP, username)
        #evaluate if the game it's about to strat
        return _get_response (200, status)   
    elif event["requestContext"]["eventType"] == "DISCONNECT":
        db.remove_user(connectionIP) #delete later, this it's only for testing
        #is_player = db.user_isPlayer(connectionIP) "send message saying player X it's out of the game"
        return _get_response (200, "Disconnected!")  
    else:
        return _get_response (500, "Something went wrong")  
    return response

def default_message(event, context):
    return _get_response(400, "Unrecognized WebSocket action.")
