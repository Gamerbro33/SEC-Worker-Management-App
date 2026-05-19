from flask import Blueprint, request, jsonify, render_template, redirect, url_for, session, json
from flask import Response,send_from_directory
import os
import app.models as db
from app import socketio, JobsiteNamespace  # Import necessary components
from flask import abort


# Blueprint and API key setup
bp = Blueprint('routes', __name__)
api_key = os.getenv('GOOGLE_MAPS_API_KEY')

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/index')
def main():
    return render_template('index.html')

@bp.route('/about')
def about():
    return render_template('about.html')

@bp.route('/signup')
def signup():
    return render_template('signup.html')

@bp.route('/login')
def login():
    return render_template('login.html')

@bp.route('/removeUserPage')
def removeUser():
     return render_template('pm/removeUser.html')
 
@bp.route('/pmLandingPage')
def pmLandingPage():
    user = session.get('user')
    if not user or user['type'] != 'pm':
        abort(403)  # Unauthorized access
    return render_template('pm/landingPage.html')

@bp.route('/pmMainPage')
def pmMainPage():
    jobsite = request.args.get('jobsite')
    return render_template('pm/mainPage.html', api_key=api_key, jobsite=jobsite)

@bp.route('/workerMainPage')
def workerMainPage():
    return render_template('worker.html', api_key=api_key)

@bp.route('/workerJobsitesPage')
def workerJobsitesPage():
    return render_template('workerJobsites.html', api_key=api_key)

@bp.route('/pmViewPage')
def pmViewPage():
    jobsite = request.args.get('jobsite')
    return render_template('pm/viewPage.html', jobsite=jobsite, api_key=api_key)

@bp.route('/editJobsite', methods=['POST'])
def editJobsite():
    jobsite = json.dumps(request.get_json())  # json dumps should ensure the json is valid before being sent
    return redirect(url_for('routes.pmMainPage', jobsite=jobsite))

@bp.route('/viewJobsite', methods=['POST'])
def viewJobsite():
    jobsite = json.dumps(request.get_json())  # json dumps should ensure the json is valid before being sent
    return redirect(url_for('routes.pmViewPage', jobsite=jobsite))

@bp.route('/deleteJobsite', methods=['POST'])
def deleteJobsite():
    jobsite = request.json # json dumps should ensure the json is valid before being sent
    name = jobsite['name']
    uuid = jobsite['uuid']
    db.removeJobsite(uuid, name)# will call the database and delete jobsite
    return redirect(url_for('routes.pmLandingPage'))

@bp.route('/successPage')
def successPage():
    username = session.get('username', 'Guest')  # Ensure username is stored in session
    return render_template('pm/successPage.html', username=username, api_key=api_key)

@bp.route('/submitProject', methods=['POST'])
def projectSubmitted():
    projectName = request.form['name']
    projectDescription = request.form['description']
    projectLat = request.form['latitude']
    projectLon = request.form['longitude']
    projectRadius = request.form['radius']

    query = db.addJobSite(projectName, projectDescription, projectLat, projectLon, projectRadius)
    if query:
        # Get the jobsite UUID
        jobsiteUUID = db.getLastInsertedJobsiteUUID()  # Retrieve the new jobsite UUID

        #Store the jobsite ID in session
        session['last_created_jobsite_id'] = jobsiteUUID
        session.modified = True  # Force session update just in case

        # Register socket namespace
        namespace = f"/jobsite/{jobsiteUUID}"
        socketio.on_namespace(JobsiteNamespace(namespace))
        print(f"Registering namespace for jobsite {jobsiteUUID}")

        # Optionally render coordinates for quick map fallback (if session fails)
        return render_template('pm/successPage.html', selectedLat=projectLat, selectedLng=projectLon, api_key=api_key)
    else:
        return jsonify({'success': False})


@bp.route('/updateJobsite', methods=['POST'])
def updateJobsite():
    projectUUID = request.form['uuid']
    projectName = request.form['name']
    projectDescription = request.form['description']
    projectLat = request.form['latitude']
    projectLon = request.form['longitude']
    projectRadius = request.form['radius']
    
    query = db.updateJobSite(projectUUID, projectName, projectDescription, projectLat, projectLon, projectRadius)
   
    return redirect(url_for('routes.pmLandingPage'))

@bp.route('/loginButtonClicked', methods=['POST'])
def loginButtonClicked():
    username = request.form['username']
    password = request.form['password']

    query = db.correctUser(username, password)

    if not query:
        return render_template('login.html', text="Incorrect username or password")
    
    user = db.getUser(username=username)  # returns tuple (UUID, username, hashed_password, type)
    userType = user[3]
    session['user'] = {'UUID': user[0], 'username': user[1], 'type': user[3]}
    session.modified = True  # Ensure session updates
    print("User stored in session:", session.get('user'))
    if userType == "pm":
        return redirect(url_for('routes.pmLandingPage'))
    if userType == "worker":
        return redirect(url_for('routes.workerMainPage'))
    
@bp.route('/logoutButtonClicked', methods=['POST'])
def logoutButtonClicked():
    session.pop('user', None)
    session.modified = True  # Force session update
    
    return redirect(url_for('routes.login'))

@bp.route('/returnToLandingPageClicked', methods=['POST'])
def returnToLandingPageClicked():
    return redirect(url_for('routes.pmLandingPage'))

@bp.route('/signupButtonClicked', methods=['POST'])
def signupButtonClicked():
    username = request.form['username']
    password = request.form['password']
    type = request.form['workerType']
    text = ""
    if(db.checkExistingUsername(username)):
        text ="Username already exists"
        return render_template('login.html', text=text)
    else: 
        #checks if anything in the textboxs are blanks
        if username != "" and password != "" and type != "" :
            if type == "pm" or type == "worker":
                if db.signup(username, password, type):
                    return render_template('login.html')
            else:
                text = "type is incorrect please type pm or worker"
                return render_template('login.html', text=text)
        else:
            print("username, password, and/or type is blank")
    return ('', 204)  # empty response so flask doesn't throw an error

# this type of function should be in the api.py file, please move it there
@bp.route('/showJobsite', methods=['GET'])
def showJobsite():
    jobsite_id = session.get('last_created_jobsite_id')
    if not jobsite_id:
        return jsonify({'error': 'Jobsite ID not found'}), 404

    jobsite = db.getJobsiteByUUID(jobsite_id)
    if jobsite:
       return jsonify({
    'lat': float(jobsite["latitude"]),
    'lng': float(jobsite["longitude"]),
    'name': jobsite["title"]
})
    else:
        return jsonify({'error': 'Jobsite not found'}), 404

@bp.route('/assignUserToJobsite', methods=['POST'])
def assignUserToJobsite():
    userUUID = request.form['userUUID']
    jobsiteUUID = request.form['jobsiteUUID']
    
    db.loadUserJobsiteAssignmentTable()
    
    success = db.assignUserToJobsite(userUUID, jobsiteUUID)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'User is currrently assigned or error assigning user.'})
    
@bp.route('/removeUserFromJobsite', methods=['POST'])
def removeUserFromJobsite():
    userUUID = request.form['userUUID']
    jobsiteUUID = request.form['jobsiteUUID']
     
    db.loadUserJobsiteAssignmentTable()
     
    success = db.removeUserFromJobsite(userUUID, jobsiteUUID)
    if success:
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'error': 'Failed to assign user to jobsite'})
     
@bp.route('/displaySelectAssignedUser', methods=['POST'])
def displaySelectAssignedUser():
    userUUID = request.form['userUUID']
 
    userAssign = db.displaySelectAssignedUser(userUUID)
     
    assign_users_format =[
        {
            "userUUID": userAssign[0],
            "jobsiteUUID": userAssign[1],
        }
        for assigned in userAssign
    ]
    return jsonify(assign_users_format)

@bp.route('/assignUsers')
def assign_users():
    return render_template('pm/assignUser.html')

@bp.route('/getAssignedJobsites')
def get_assigned_jobsites():
    user = session.get('user')
    if not user or user['type'] != 'worker':
        return jsonify({'success': False, 'error': 'Unauthorized access'})

    userUUID = user['UUID']
    jobsites = db.getAssignedJobsites(userUUID)
    if jobsites:
        return jsonify({'success': True, 'jobsites': jobsites})
    else:
        return jsonify({'success': False, 'error': 'No jobsites assigned'})

#this will be called when user is being change in removed from assigned jobsites
@bp.route('/getAssignedJobsitesPM', methods=['POST'])
def get_assigned_jobsites_for_pm():
    userUUID = request.form['userUUID']
    jobsites = db.getAssignedJobsites(userUUID)

    return jsonify(jobsites)

@bp.route('/getAssignedJobsitesPMJSON', methods=['POST'])
def get_assigned_jobsites_for_pm_json():
    data = request.get_json()  # Parse JSON data from the request body
    userUUID = data.get('userUUID')  # Safely get the userUUID from the JSON payload

    if not userUUID:
        return jsonify({'error': 'userUUID is required'}), 400

    jobsites = db.getAssignedJobsites(userUUID)
    return jsonify(jobsites)
    
@bp.route('/getAllUsers')
def get_users():
    # Fetch all users from the database
    users = db.getAllUsers()
    # Format the users as a list of dictionaries
    users_formatted = [
        {
            "UUID": user[0],  # UUID
            "username": user[1],  # Username
        }
        for user in users
    ]
    return jsonify(users_formatted)

# this type of function should be in the api.py file, please move it there
@bp.route('/getAllWorkerUsers')
def get_worker_users():
    # Fetch all users from the database
    users = db.getAllWorkerUsers()
    # Format the users as a list of dictionaries
    users_formatted = [
        {
            "UUID": user[0],  # UUID
            "username": user[1],  # Username
        }
        for user in users
    ]
    return jsonify(users_formatted)

# this type of function should be in the api.py file, please move it there
@bp.route('/getJobsitesForWorkers')
def get_jobsites_for_workers():
    # Fetch jobsites from the database
    jobsites = db.getJobsitesForWorkers()
    
    # Format the jobsites as a list of dictionaries
    jobsites_formatted = [
        {
            "UUID": jobsite[0],  # UUID
            "title": jobsite[1],  # Title
            "description": jobsite[2],  # Description
            "latitude": jobsite[3],  # Latitude
            "longitude": jobsite[4],  # Longitude
            "radius": jobsite[5]  # Radius
        }
        for jobsite in jobsites
    ]
    
    return jsonify(jobsites_formatted)

# this type of function should be in the api.py file, please move it there
@bp.route('/getAssignedUsersForJobsite', methods=['POST'])
def get_assigned_users_for_jobsite():
    jobsiteUUID = request.form['jobsiteUUID']
    assigned_users = db.getAssignedUsersForJobsite(jobsiteUUID)
    
    formatted = [
        {
            "UUID": user[0],
            "username": user[1]
        }
        for user in assigned_users
    ]
    return jsonify(formatted)

@bp.route('/getAssignedUsersForJobsiteJSON', methods=['POST'])
def get_assigned_users_for_jobsite_json():
    data = request.get_json()  # Parse JSON data from the request body
    jobsiteUUID = data.get('jobsiteUUID')  # Safely get the jobsiteUUID from the JSON payload

    if not jobsiteUUID:
        return jsonify({'error': 'jobsiteUUID is required'}), 400

    assigned_users = db.getAssignedUsersForJobsite(jobsiteUUID)
    
    formatted = [
        {
            "UUID": user[0],
            "username": user[1]
        }
        for user in assigned_users
    ]
    return jsonify(formatted)

@bp.route('/timeCards', methods=['GET'])
def time_cards():
    return render_template('pm/timeCards.html')

@bp.route('/logTimeCard', methods=['POST'])
def log_time_card():
    data = request.get_json()
    worker_uuid = data.get('workerUUID')
    jobsite_uuid = data.get('jobsiteUUID')
    entered = data.get('entered')
    exited = data.get('exited')

    if not all([worker_uuid, jobsite_uuid, entered, exited]):
        return jsonify({'success': False, 'error': 'Missing data'}), 400

    try:
        db.log_time_card(worker_uuid, jobsite_uuid, entered, exited)
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error logging timecard: {e}")
        return jsonify({'success': False, 'error': 'Failed to log timecard'}), 500


@bp.route('/getTimeCard', methods=['GET'])
def get_time_card():
    worker_uuid = request.args.get('workerUUID')
    date = request.args.get('date')

    if not worker_uuid or not date:
        return jsonify({'success': False, 'error': 'Missing workerUUID or date'}), 400

    time_card = db.get_time_card(worker_uuid, date)
    return jsonify({'success': True, 'username': time_card['username'], 'entries': time_card['entries']})

# this type of function should be in the api.py file, please move it there
@bp.route('/profile')
def profile():
    if 'user' not in session:
        return redirect(url_for('routes.login'))

    session_user = session['user']
    user_tuple = db.getUser(UUID=session_user['UUID'])

    if not user_tuple:
        return redirect(url_for('routes.login'))

    user_info = {
        'UUID': user_tuple[0],
        'username': user_tuple[1],
        'type': user_tuple[3]
    }

    return render_template('pm/profile.html', user=user_info)

# this type of function should be in the api.py file, please move it there
@bp.route('/upload_profile_picture_blob', methods=['POST'])
def upload_profile_picture_blob():
    if 'user' not in session:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401

    file = request.files.get('profilePic')
    if not file:
        return jsonify({'success': False, 'error': 'No file provided'}), 400

    blob_data = file.read()

    try:
        db.updateProfilePicture(session['user']['UUID'], blob_data)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# this type of function should be in the api.py file, please move it there
@bp.route('/get_profile_picture/<user_id>')
def get_profile_picture(user_id):
    try:
        blob_data = db.getProfilePicture(user_id)
        if blob_data:
            return Response(blob_data, mimetype='image/jpeg')
        else:
             return send_from_directory('static/assets', 'DefaultPFP.jpg')
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@bp.route('/changePasswordPM', methods=['POST'])
def change_passwordPM():
    current_password = request.form['currentPassword']
    new_password = request.form['newPassword']
    confirm_password = request.form['confirmPassword']

    user = session.get('user')
    if not user:
        return redirect(url_for('routes.login'))

    user_record = db.getUser(UUID=user['UUID'])

    if not db.correctUser(user_record[1], current_password):
        return render_template('pm/profile.html', user=user, error="Current password is incorrect.")

    if new_password != confirm_password:
        return render_template('pm/profile.html', user=user, error="New passwords do not match.")

    if db.update_user_password(user['UUID'], new_password):
        return render_template('pm/profile.html', user=user, success="Password updated successfully.")
    else:
        return render_template('pm/profile.html', user=user, error="Failed to update password.")

@bp.route('/changePasswordWorker', methods=['POST'])
def change_passwordWorker():
    current_password = request.form['currentPassword']
    new_password = request.form['newPassword']
    confirm_password = request.form['confirmPassword']

    user = session.get('user')
    if not user:
        return redirect(url_for('routes.login'))

    user_record = db.getUser(UUID=user['UUID'])

    if not db.correctUser(user_record[1], current_password):
        return render_template('workerProfile.html', user=user, error="Current password is incorrect.")

    if new_password != confirm_password:
        return render_template('workerProfile.html', user=user, error="New passwords do not match.")

    if db.update_user_password(user['UUID'], new_password):
        return render_template('workerProfile.html', user=user, success="Password updated successfully.")
    else:
        return render_template('workerProfile.html', user=user, error="Failed to update password.")

# this type of function should be in the api.py file, please move it there
@bp.route('/workerProfile')
def worker_profile():
    if 'user' not in session:
        return redirect(url_for('routes.login'))

    session_user = session['user']
    user_tuple = db.getUser(UUID=session_user['UUID'])

    if not user_tuple:
        return redirect(url_for('routes.login'))

    user_info = {
        'UUID': user_tuple[0],
        'username': user_tuple[1],
        'type': user_tuple[3]
    }

    return render_template('workerProfile.html', user=user_info)


@bp.route('/workerhelp')
def workerHelp():
    return render_template('workerhelp.html')


@bp.route('/pmhelp')
def pmhelp():
    return render_template('pm/pmhelp.html')


