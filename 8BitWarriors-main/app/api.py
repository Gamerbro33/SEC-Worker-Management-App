from flask import Blueprint, request, jsonify, session
import app.models as db
bp = Blueprint('api', __name__)

# our api routes below here:
# api routes are our functions that return data to our front end
    
@bp.route('/getJobsitesForWorkers')
def getJobsitesForWorkers():
    return jsonify(db.getJobsitesForWorkers())

#to help display users who are online for future reference
@bp.route('/getWorkersLoggedIn')
def getWorkersLoggedIn():
    return jsonify(db.getWorkersLoggedIn())

@bp.route('/sendUserToFrontend')
def sendUserToFrontend():
    return jsonify(session['user'])

#@bp.route('/workersLiveLocation', methods=['POST'])
#def workersLiveLocation():
#    data = request.get_json() # viewpage.js has jobsite info, and sends a fetch request to this route
#    uuid = data['jobsiteUUID']
#    return db.getWorkerLocations(uuid) # returns all workers at a jobsite, and fetch has a console log to print it


# api routes above here