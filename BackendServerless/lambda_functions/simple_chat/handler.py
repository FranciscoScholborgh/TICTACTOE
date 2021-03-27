import json
import boto3
from utils.aws_methods import get_response
from utils.database import SimpleChatDB

apiUrl = "https://psmhp2yn01.execute-api.us-east-1.amazonaws.com/dev"
client = boto3.client("apigatewaymanagementapi", endpoint_url=apiUrl)
db = SimpleChatDB("mongodb+srv://tictactoedb:fa6PQ1Xy8CCRoUou@cluster0.hb7sg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", "tictactoe_db")

#:param userID: String user identification in the database collections of users
#:param username: String name of a users
#:return: returns dir with the code state of the response (int) and a message with game status and players and spectator access       
def send_update(userID:str, users:list, message:object):
    for user in users:
        try:
            id= user.get("_id") 
            sent = True if id == userID else False
            message.get("response_data")["author"] = sent 
            client.post_to_connection(ConnectionId=id, Data=json.dumps(message))
        except:
            pass

def simple_chat(event, context):
    body = json.loads(event.get("body"))
    request = body.get("request")
    chat = db.load_chat()
    for message in chat:
        del message['_id']
    if request == "LOAD_CHAT":
        userID = event["requestContext"].get("connectionId")
        username = db.get_user(userID).get("username") if db.get_user(userID) is not None else None
        response = {"action":"LOAD_CHAT", "response_data": chat, "username": username}
        return get_response (200, response)
    elif request == "SEND_MESSAGE":
        username = body.get("username")
        message = body.get("message")
        time = body.get("time") # or get time from localmachine
        db.send_message(username, message, time)
        update_message = {"username":username, "message":message, "time":time}
        response = {"action":"UPDATE_CHAT", "response_data": update_message}
        users = list(db.get_users())
        userID = event["requestContext"].get("connectionId")
        send_update(userID,users, response)
        return get_response (200, 'message sent!')
    else:
        return get_response (500, "Something went wrong")
