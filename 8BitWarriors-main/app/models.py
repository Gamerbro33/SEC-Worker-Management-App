import sqlite3
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

#NOTE this is for when we switch from SQLite to MySQL/(Heroku databases) trying to have this on here
# please dont delete this def or the stuff that is commented in this def
#import mysql.connector
#def MySQLTemplate() {
    #mydb = mysql.connector.connect(
    #host="localhost"
    #user="root"
    #password=""
    #database="insert database of you want to connect"
    #)
#}

# Database loading functions
def loadAllDatabases():
    loadUserDatabase()
    loadJobsiteDatabase()
    #loadJobsiteTrackingDatabase()
    loadUserJobsiteAssignmentTable()
    create_time_cards_table()

# User Authentication and Registration
def signup(username, password, type):
    if username == "" or password == "" or type == "":
        return False

    userId = str(uuid.uuid1())
    hashed_password = generate_password_hash(password)
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()

    sql = """INSERT INTO tempUser(UUID, username, password, type) VALUES (?,?,?,?)"""
    val = (userId, username, hashed_password, type)
    
    try:
        crsr.execute(sql, val)
        conn.commit()
        return True
    except Exception as e:
        print(f"An error has been found: {e}")
        return False
    finally:
        conn.close()

def correctUser(username, password): 
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()

    sql = """SELECT password FROM tempUser WHERE username = ?"""
    
    try:
        crsr.execute(sql, (username,))
        stored_password = crsr.fetchone()
        if stored_password is not None and check_password_hash(stored_password[0], password):
            return True
        else:
            return False
    except Exception as e: 
        print(f"An error has been found: {e}")
    finally:
        conn.close()

def getUser(UUID=None, username=None):
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()
    
    sql = "SELECT UUID, username, password, type FROM tempUser WHERE 1=1"
    params = []
    
    if UUID:
        sql += " AND UUID = ?"
        params.append(UUID)
    if username:
        sql += " AND username = ?"
        params.append(username)
    
    crsr.execute(sql, params)
    user = crsr.fetchone()
    conn.close()
    
    return user

def getAllUsers():
    try:
        conn = sqlite3.connect("templateUser.db")
        crsr = conn.cursor()
        sql = "SELECT UUID, username FROM tempUser"
        crsr.execute(sql)
        users = crsr.fetchall()
        return users
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        return []  # Return an empty list in case of an error
    finally:
        if conn:
            conn.close()  # Ensure the connection is closed

def getAllWorkerUsers():
    try:
        conn = sqlite3.connect("templateUser.db")
        crsr = conn.cursor()
        sql = "SELECT UUID, username FROM tempUser WHERE type ='worker';"
        crsr.execute(sql)
        users = crsr.fetchall()
        return users
    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        return []  # Return an empty list in case of an error
    finally:
        if conn:
            conn.close()  # Ensure the connection is closed

# Jobsite Management
def addJobSite(title, description, latitude, longitude, radius):
    jobId = str(uuid.uuid1())
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()

    sql = """INSERT INTO jobsites(UUID, title, description, latitude, Longitude, radius) VALUES(?,?,?,?,?,?)"""
    val = (jobId, title, description, latitude, longitude, radius)
    
    try:
        crsr.execute(sql, val)
        conn.commit()
        return True
    except Exception as e:
        print(f"An error has been found: {e}")
        return False
    finally:
        conn.close()

def getJobsitesForWorkers():
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = """SELECT * FROM jobsites"""
    crsr.execute(sql)
    rows = crsr.fetchall()
    return rows

def getLastInsertedJobsiteUUID():
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = "SELECT UUID FROM jobsites ORDER BY rowid DESC LIMIT 1"
    try:
        crsr.execute(sql)
        result = crsr.fetchone()
        return result[0] if result else None
    except Exception as e:
        print(f"An error has been found: {e}")
        return None
    finally:
        conn.close()

# Worker Location Tracking
#def updateWorkerLocation(workerUUID, workerName, location, jobsiteUUID):
#    conn = sqlite3.connect("trackedJobsites.db")
#    crsr = conn.cursor()
#    sql_check = f"""SELECT * FROM '{jobsiteUUID}' WHERE workerUUID = ?"""
#    sql_insert = f"""INSERT INTO '{jobsiteUUID}'(workerUUID, workerName, location) VALUES (?,?,?);"""
#    sql_update = f"""UPDATE '{jobsiteUUID}' SET location = ? WHERE workerUUID = ?;"""
#    try:
#        crsr.execute(sql_check, (workerUUID,))
#        if crsr.fetchone():  # if the worker is already in the database
#            crsr.execute(sql_update, (location, workerUUID))  # update the location
#        else:
#            crsr.execute(sql_insert, (workerUUID, workerName, location))  # insert the worker, name, and location
#        conn.commit()
#        return True
#    except Exception as e:
#        print(f"An error has been found: {e}")
#        return False
#    finally:
#        conn.close()

#TODO Show a list how assigned jobsite page in nav on worker side.
def updateJobSite(projectUUID, projectName, projectDescription, projectLat, projectLon, projectRadius):
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql =f"""UPDATE jobsites SET title = '{projectName}', description ='{projectDescription}', latitude={projectLat}, Longitude={projectLon}, radius={projectRadius} WHERE UUID = '{projectUUID}';"""
    crsr.execute(sql)
    conn.commit()


def getWorkerLocations(jobsiteUUID):
    conn = sqlite3.connect("trackedJobsites.db")
    crsr = conn.cursor()
    try:
        sql = f"""SELECT * FROM '{jobsiteUUID}'"""
        crsr.execute(sql)
        rows = crsr.fetchall()
        return rows
    except Exception as e:
        print(f"An error has been found: {e}")
        return False
    finally:
        conn.close()

# Polygon Geofence Jobsites (more complex jobsite)
def addPolygonJobSite(title, description, coordList, radius):
    jobId = str(uuid.uuid1())
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()

    sql = """INSERT INTO polygonJobsites(UUID, title, description, coordinates_1, coordinates_2 ,coordinates_3, coordinates_4) VALUES(?,?,?,?,?,?,?)"""
    val = (jobId, title, description, coordList[0], coordList[1], coordList[2], coordList[3])
    
    try:
        crsr.execute(sql, val)
        conn.commit()
        return True
    except Exception as e:
        print(f"An error has been found: {e}")
        return False
    finally:
        conn.close()

# Load databases
def loadJobsiteDatabase():
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = """CREATE TABLE IF NOT EXISTS jobsites(
    UUID TEXT NOT NULL, 
    title TEXT NOT NULL, 
    description TEXT NOT NULL,
    latitude TEXT NOT NULL,
    Longitude TEXT NOT NULL, 
    radius TEXT NOT NULL);"""
    crsr.execute(sql)
    conn.close()

#def loadJobsiteTrackingDatabase():
#    conn = sqlite3.connect("trackedJobsites.db")
#    crsr = conn.cursor()
#    jobsiteUUIDS = getJobsitesUUIDs()
#    for UUID in jobsiteUUIDS:
#        sql = f"""CREATE TABLE IF NOT EXISTS '{UUID[0]}'(
#        workerUUID TEXT NOT NULL, 
#        workerName TEXT NOT NULL,
#        location TEXT NOT NULL);"""
#        crsr.execute(sql)
#    conn.close()

def loadUserDatabase():
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()
    sql = """CREATE TABLE IF NOT EXISTS tempUser(
    UUID TEXT NOT NULL, 
    username TEXT NOT NULL, 
    password TEXT NOT NULL,
    type TEXT NOT NULL);"""
    crsr.execute(sql)
    conn.close()

def getJobsitesUUIDs():
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = """SELECT UUID FROM jobsites"""
    crsr.execute(sql)
    rows = crsr.fetchall()
    return rows

def loadUserJobsiteAssignmentTable():
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = """CREATE TABLE IF NOT EXISTS userJobsiteAssignments(
        userUUID TEXT NOT NULL,
        jobsiteUUID TEXT NOT NULL,
        UNIQUE(userUUID, jobsiteUUID));"""
    crsr.execute(sql)
    conn.close()

def assignUserToJobsite(userUUID, jobsiteUUID):
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    try:
        # Check if assignment already exists
        check_sql = "SELECT 1 FROM userJobsiteAssignments WHERE userUUID = ? AND jobsiteUUID = ?"
        crsr.execute(check_sql, (userUUID, jobsiteUUID))
        if crsr.fetchone():
            print("Assignment already exists.")
            return False

        insert_sql = "INSERT INTO userJobsiteAssignments(userUUID, jobsiteUUID) VALUES (?, ?)"
        crsr.execute(insert_sql, (userUUID, jobsiteUUID))
        conn.commit()
        return True
    except Exception as e:
        print(f"An error has been found: {e}")
        return False
    finally:
        conn.close()

def removeUserFromJobsite(userUUID, jobsiteUUID):
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = "DELETE FROM userJobsiteAssignments WHERE userUUID = ? AND jobsiteUUID = ?"
    val = (userUUID, jobsiteUUID)
    try:
        crsr.execute(sql, val)
        conn.commit()
        return True
    except Exception as e:
        print(f"An error has been found: {e}")
        return False
    finally:
        conn.close()

def removeJobsite(jobsiteUUID, jobsiteName):
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = f"""DELETE FROM jobsites WHERE UUID = ? AND title = ?;"""
    val = (jobsiteUUID, jobsiteName)
    try:
        crsr.execute(sql, val)
        conn.commit()
        return True
    except Exception as e:
        print(f"An error has been found: {e}")
        return False
    finally:
        conn.close()

def displaySelectAssignedUser(userUUID) :
     conn = sqlite3.connect("tempJobsite.db")
     crsr = conn.cursor()
     sql = "SELECT * FROM userJobsiteAssignments WHERE userUUID= '"+userUUID+"';"
     crsr.execute(sql)
     print(crsr)
     conn.commit()
     return []
  

def checkExistingUsername(username):
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()
    sql = "SELECT UUID, username FROM tempUser WHERE username = '"+username+"';"
    crsr.execute(sql)    
    #checks to see if it exist for testing  
    #result = crsr.fetchone()
    #print(result)
    #needs to see if at least one users has the same username to return true
    if crsr.fetchone():
        print("Username already taken please use another")
        return True
    else:
        return False


def getAssignedJobsites(userUUID):
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = """
        SELECT j.UUID, j.title, j.description, j.latitude, j.longitude, j.radius
        FROM jobsites j
        JOIN userJobsiteAssignments uja ON j.UUID = uja.jobsiteUUID
        WHERE uja.userUUID = ?
    """
    try:
        crsr.execute(sql, (userUUID,))
        jobsites = crsr.fetchall()
        for row in jobsites:
            print(row)
        return [
            {
                "UUID": jobsite[0],
                "title": jobsite[1],
                "description": jobsite[2],
                "latitude": jobsite[3],
                "longitude": jobsite[4],
                "radius": jobsite[5]
            }
            for jobsite in jobsites
        ]
    except Exception as e:
        print(f"An error has been found: {e}")
        return []
    finally:
        conn.close()

def getJobsiteByUUID(uuid):
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = "SELECT UUID, title, description, latitude, Longitude, radius FROM jobsites WHERE UUID = ?"
    try:
        crsr.execute(sql, (uuid,))
        result = crsr.fetchone()
        if result:
            return {
                "UUID": result[0],
                "title": result[1],
                "description": result[2],
                "latitude": result[3],
                "longitude": result[4],
                "radius": result[5]
            }
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        conn.close()

def getAssignedUsersForJobsite(jobsiteUUID):
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()

    try:
        # Attach the user database
        crsr.execute("ATTACH DATABASE 'templateUser.db' AS userDB")

        sql = """
            SELECT u.UUID, u.username
            FROM userDB.tempUser u
            JOIN userJobsiteAssignments a ON u.UUID = a.userUUID
            WHERE a.jobsiteUUID = ?
        """

        crsr.execute(sql, (jobsiteUUID.strip(),))
        return crsr.fetchall()

    except Exception as e:
        print(f"An error occurred in getAssignedUsersForJobsite: {e}")
        return []

    finally:
        conn.close()

def get_time_card(worker_uuid, date):
    conn = sqlite3.connect("database.db")
    crsr = conn.cursor()
    try:
        # Attach the user database
        crsr.execute("ATTACH DATABASE 'templateUser.db' AS userDB")

        # Fetch the timecard entries
        sql = """
            SELECT entered, exited
            FROM time_cards
            WHERE workerUUID = ? AND date = ?
            ORDER BY entered
        """
        crsr.execute(sql, (worker_uuid, date))
        entries = crsr.fetchall()

        # Fetch the worker's username
        username_sql = "SELECT username FROM userDB.tempUser WHERE UUID = ?"
        crsr.execute(username_sql, (worker_uuid,))
        result = crsr.fetchone()
        username = result[0] if result else 'Unknown'

        # Return the timecard data
        return {
            'username': username,
            'entries': [{'entered': row[0], 'exited': row[1]} for row in entries]
        }
    except Exception as e:
        print(f"Error fetching timecard: {e}")
        return {'username': 'Unknown', 'entries': []}
    finally:
        conn.close()

def log_time_card(worker_uuid, jobsite_uuid, entered, exited):
    conn = sqlite3.connect("database.db")
    crsr = conn.cursor()
    sql = """
        INSERT INTO time_cards (workerUUID, jobsiteUUID, entered, exited)
        VALUES (?, ?, ?, ?)
    """
    try:
        crsr.execute(sql, (worker_uuid, jobsite_uuid, entered, exited))
        conn.commit()
    except Exception as e:
        print(f"Error logging timecard: {e}")
        raise
    finally:
        conn.close()

def create_time_cards_table():
    conn = sqlite3.connect("database.db")
    crsr = conn.cursor()
    sql = """CREATE TABLE IF NOT EXISTS time_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workerUUID TEXT NOT NULL,
            jobsiteUUID TEXT NOT NULL,
            entered TEXT NOT NULL,
            exited TEXT NOT NULL,
            date TEXT GENERATED ALWAYS AS (DATE(entered)) VIRTUAL
        );"""
    crsr.execute(sql)
    conn.close()

def updateProfilePicture(userUUID, blob_data):
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()
    try:
        crsr.execute("ALTER TABLE tempUser ADD COLUMN profile_pic BLOB")
    except sqlite3.OperationalError:
        # Column already exists
        pass

    sql = """UPDATE tempUser SET profile_pic = ? WHERE UUID = ?"""
    crsr.execute(sql, (blob_data, userUUID))
    conn.commit()
    conn.close()

def getProfilePicture(userUUID):
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()
    try:
        crsr.execute("SELECT profile_pic FROM tempUser WHERE UUID = ?", (userUUID,))
        result = crsr.fetchone()
        return result[0] if result else None
    except Exception as e:
        print(f"Error retrieving profile picture: {e}")
        return None
    finally:
        conn.close()

def update_user_password(userUUID, new_password):
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()
    hashed_password = generate_password_hash(new_password)
    try:
        crsr.execute("UPDATE tempUser SET password = ? WHERE UUID = ?", (hashed_password, userUUID))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating password: {e}")
        return False
    finally:
        conn.close()
