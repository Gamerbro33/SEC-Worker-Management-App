# socket.io code below here:
from flask import Blueprint
import app.models as db
from app import socketio

bp = Blueprint('socket', __name__)

@socketio.on('send_location')
def workerSendingLocation(userData):
    #print("working sending location")
    userObj = userData['user']
    locationObj = userData['userLocation']
    jobsite = userData['selectedJobsite']

    #print("jobsite: ", jobsite)
    #print("userObj: ", userObj)

    location = str(locationObj['lat']) + "," + str(locationObj['lng'])
    #db.updateWorkerLocation(userObj['UUID'], userObj['username'], location, jobsite['uuid'])
    # i think im going to get rid of the database stuff for now and just emit the location to the clients

    # btw the workers dont get deleted from the online workers list when they log out
    # dont have the time to do before tomorrow's presentation

    # so this emits to any clients connected to the room with jobsite's uuid
    # in viewpage.js, there is no socket.io functionality so add that in if you can! (make sure to connect to the right room)
    socketio.emit('jobsite_location_update', {
        'location': locationObj,
        'user': userObj
    }, namespace=f'/jobsite/{jobsite["uuid"]}')
    # if you have time as well you could the workers in the sidebar with their names and locations but that might be a lot of work

    return

# socket.io code above here