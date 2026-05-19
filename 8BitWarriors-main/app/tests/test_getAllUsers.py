import sqlite3
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

# Database loading functions
def loadAllDatabases():
    loadUserDatabase()
    loadJobsiteDatabase()
    loadJobsiteTrackingDatabase()

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

def loadJobsiteTrackingDatabase():
    conn = sqlite3.connect("trackedJobsites.db")
    crsr = conn.cursor()
    jobsiteUUIDS = getJobsitesUUIDs()
    for UUID in jobsiteUUIDS:
        sql = f"""CREATE TABLE IF NOT EXISTS '{UUID[0]}'(
        workerUUID TEXT NOT NULL, 
        workerName TEXT NOT NULL,
        location TEXT NOT NULL);"""
        crsr.execute(sql)
    conn.close()

def getJobsitesUUIDs():
    conn = sqlite3.connect("tempJobsite.db")
    crsr = conn.cursor()
    sql = """SELECT UUID FROM jobsites"""
    crsr.execute(sql)
    rows = crsr.fetchall()
    return rows

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

def getAllUsers():
    conn = sqlite3.connect("templateUser.db")
    crsr = conn.cursor()
    
    # SQL query to fetch all users
    sql = "SELECT UUID, username FROM tempUser"
    crsr.execute(sql)
    workers = crsr.fetchall()  # Fetch all rows
    conn.close()
    
    return workers

# Test the function
if __name__ == "__main__":
    workers = getAllUsers()
    if workers:
        print("Users fetched successfully:")
        for worker in workers:
            print(f"UUID: {worker[0]}, Username: {worker[1]}")
    else:
        print("No users found or an error occurred.")