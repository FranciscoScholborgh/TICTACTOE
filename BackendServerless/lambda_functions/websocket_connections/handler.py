import json
import boto3

connectionHandler_function = 'arn:aws:lambda:us-east-1:615551906171:function:tictactoe-handleconnections-dev-tictactoe_handleConnections'
client = boto3.client('lambda')

def _get_response(statusCode: int, message: object):
    return {
        "statusCode": statusCode,
        "body": json.dumps(message)
    }
    
def invoke_lambdaFunction(function_arn: str,data: dir):
    return client.invoke(
        FunctionName = function_arn,
        InvocationType = 'RequestResponse',
        Payload = json.dumps(data)
    )

def connection_manager(event, context):
    try:
        action = event["requestContext"]["eventType"]
        if action == "CONNECT": 
            return _get_response (200, "Connected!")
        elif action == "DISCONNECT":
            userID = event["requestContext"].get("connectionId")
            data = {"action":action, "userID":userID}
            invoke_lambdaFunction(connectionHandler_function, data)
        return _get_response (200, "Connected!")  
    except KeyError:
        return _get_response (500, "Something went wrong")  

def default_message(event, context):
    return _get_response(400, "Unrecognized WebSocket action.")
