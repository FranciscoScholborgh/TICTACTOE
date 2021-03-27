import json
import boto3
import copy
from utils.database import SimpleChatDB

apiUrl = "https://psmhp2yn01.execute-api.us-east-1.amazonaws.com/dev"
client = boto3.client("apigatewaymanagementapi", endpoint_url=apiUrl)
db = SimpleChatDB("mongodb+srv://tictactoedb:fa6PQ1Xy8CCRoUou@cluster0.hb7sg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", "tictactoe_db")

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

def simple_chat(event, context):
    print(event)
    body = json.loads(event.get("body"))
    request = body.get("request")
    chat = db.load_chat()
    for message in chat:
        del message['_id']
    if request == "LOAD_CHAT":
        userID = event["requestContext"].get("connectionId")
        username = db.get_user(userID).get("username") if db.get_user(userID) is not None else None
        response = {"action":"LOAD_CHAT", "response_data": chat, "username": username}
        return _get_response (200, response)
    elif request == "SEND_MESSAGE":
        username = body.get("username")
        message = body.get("message")
        time = body.get("time") # or get time from localmachine
        db.send_message(username, message, time)
        update_message = {"username":username, "message":message, "time":time}
        response = {"action":"UPDATE_CHAT", "response_data": update_message}
        users = list(db.get_users())
        send_update(users, response)
        return _get_response (200, 'message sent!')
    else:
        return _get_response (500, "Something went wrong")
