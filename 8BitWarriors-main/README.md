# 8BitWarriors
# This app will help Star Electric with employee managing. The way we will do this is by creating a web app to track the location of the employees and check to see if they are inside of a given job site.



# Starr Electric Geofencing Construction WebApp

This app allows workers to create a account and gain access to a map with a geofence radius given by a manager of the Starr Electric Company. The app will let workers clock in to a time sheet when they are within the construction area radius. The manager can be able to add, edit, and remove workers or geofence to make it more effiecient and reliable. Here is the links to our wiki pages to learn more.

Architecture:
https://github.com/SCCapstone/8BitWarriors/wiki/Architecture

Requirement:
https://github.com/SCCapstone/8BitWarriors/wiki/Requirements


## External Requirements
Before running this project, ensure the following dependencies are installed:
1. Python 3.x
  Windows:
    Navigate to the Python website and download the installer
    Run installer and check Add Python to PATH
    Verify installation using: python --version
  macOS:
    Run: brew install python
      Verity instillation using: python3 --version
    Flask
  Windows:
    Open Command Prompt
    Run: pip install flask
  macOS:
    Open Terminal
    Run: pip3 install flask
2. AWS CLI
  Windows: 
    Download the AWS CLI installer from the AWS CLI website
    Run the installer and follow the instructions that it provides
    Verify installation using: aws--version
  macOS:
    Install using: brew install awscli
    Verify installation using: aws --version
3. AWS EB CLI
  Commands are the same on both Windows and macOS:
    Install using: pip install awsebcli --upgrade --user 
    Verify installation: eb --version
4. SQLite
  Windows:
    Included with Python
    Verify using: sqlite3 --version
  macOS:
    Run: brew install sqlite 
    Verify installation using: sqlite3 --version
5. pip
  Should be included with Python 3.x
    Verify on Windows using: pip --version
    Verify on macOS using: pip3 --version
6. Git
  Windows:
    Download the installer from the Git website
    Run the installer and follow the instructions
    Verify the installation using: git --version
  macOS:
    Run: brew install git
    Verify installation using: git --version
7. Google Maps API
  No real installation required
  To interact with Google Maps API right from the Flask app(Server-Side Interaction):
    Install the library using: pip install -U googlemaps (Windows)
    Install the library using: pip3 install -U googlemaps (macOS)
8. Pytest
  Windows:
    Install using: pip install pytest
    Verify installation using: pytest --version
  macOS:
    Install using: pip3 install pytest
    Verify installation using: pytest --version
  macOS: 
    Open the terminal
    Install using: brew install node
    Verify installation using: 'node --version' and using'npm --version'
10. Tailwind CSS
  Commands are the same for both Windows and macOS:
    Navigate to project directory using the 'cd' key
    Install Tailwind CSS and dependencies using: npm install -D tailwindcss postcss autoprefixer
    Create the Tailwind configuration file: npx tailwind css init

## Setup
**Clone the repository:**
  - git clone https://github.com/SCCapstone/8BitWarriors
  - cd 8BitWarriors

**Create and activate a virtual environment:**
  - python3 -m venv venv
  - source venv/bin/activate

**Install project dependencies:**
  - pip install -r requirements.txt

**Set up environment variables:**
  - GOOGLE_MAPS_API_KEY=your_api_key_here
  - FLASK_APP=app.py

**Initialize the database:**
  - python3 app.py 


## Running

- **Activate the virtual environment**:
  - source venv/bin/activate (Mac/Linux)
  - venv\Scripts\activate (Windows)
 
- **Start the Flask App**
  - flask --app run.py run


# Deployment

1. If not already installed, install AWS CLI and AWS EB CLI (pip)
    a. make sure you are logged in
    b. make sure AWS is configured how we agree (bash: aws configure)

2. If not already setup, Setup your branch for deployment
    b. add necessary files (requirements.txt, .ebextensions/python.config)
    c. ensure files have necessary content
        python.config (we will have this setup for ELB and )
        requirements.txt (pip freeze > requirements.txt)

3. If not already initialized, Initialize Elastic Beanstalk (bash: eb init)
    a. Select AWS region
    b. choose platform python for 

4. Once all previous steps are completed...
    a. run "eb create our-app-name" which will launch or EC2 instance and deploy our application
    b. we need to have a security group to allow public access (port 80)

# Testing

First, we will use PyTest, which is a powerful testing framework for Python. To access this in VScode, install the Python extension, then open a repository that contains Python unit test, finally on the left side click Testing, and select Pytest Framework. 

Once PyTest is installed, we can create test files. PyTest will automatically detect any Python file that starts with test_ or ends with _test.py. To create unit tests we will test individual components like functions and methods in isolation. Then for behavioral tests we will test the entire app’s functionality by simulating user behavior.  

To run this PyTest code, we will use functions like: pytest test_example.py. This will run our tests inside of the file and give us feedback on each of the functions writen.  

For behavioral Test we will be using Selenium since it supports multiple programming languages and to help make efficient web application testing.

Where we are doing our Unit and Behavioral testing will be located in The Folder named "tests"

**INSTALLS INTSRUCTION TO RUN TEST**

these will be needed to be able to run unit and behavioral test in the virtual enviroment
  - pip install pytest
  - pip install -U selenium

**Running Unit Test**
  - python -m unittest tests.test_models

**Running Behavioral Test**

(NOTE: make sure you are running this test in the virtual enviroment and make sure the path is right)
  - ./path/to/pytest ./tests/behavioral_test.py
  
# Authors
- Spencer Philips - sphilips@email.sc.edu
- RJ Allen - rtallen@email.sc.edu
- Dillon McLaughlin - djm19@email.sc.edu
- Myles Carter -  mc151@email.sc.edu
- Timothy Alexander - ta19@email.sc.edu
