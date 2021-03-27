import json
from utils.aws_methods import get_response, invoke_lambdaFunction

connectionHandler_function = 'arn:aws:lambda:us-east-1:615551906171:function:tictactoe-handleconnections-dev-tictactoe_handleConnections'

def connection_manager(event, context):
    try:
        action = event["requestContext"]["eventType"]
        if action == "CONNECT": 
            return get_response (200, "Connected!")
        elif action == "DISCONNECT":
            userID = event["requestContext"].get("connectionId")
            data = {"action":action, "userID":userID}
            invoke_lambdaFunction(connectionHandler_function, data)
        return get_response (200, "Connected!")  
    except KeyError:
        return get_response (500, "Something went wrong")  

def default_message(event, context):
    return get_response(400, "Unrecognized WebSocket action.")
