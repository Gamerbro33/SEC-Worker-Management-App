from flask import Flask
from flask_socketio import SocketIO, Namespace
import app.models as db
import os
from dotenv import load_dotenv


socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    print("Creating app")
    app = Flask(__name__)
    app.secret_key = "key"
    socketio.init_app(app)
    load_dotenv()
    app.config['SESSION_COOKIE_SECURE'] = True  # Send cookies only over HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevent access to cookies via JavaScript
    db.loadAllDatabases()

    from .routes import bp as routes_bp
    from .socket import bp as socket_bp
    from .api import bp as api_bp

    app.register_blueprint(routes_bp)
    app.register_blueprint(socket_bp, url_prefix='/auth')
    app.register_blueprint(api_bp, url_prefix='/api')

    # Register namespaces for each jobsite
    for uuid in db.getJobsitesUUIDs():
        uuidString = uuid[0]
        print(f"Registering namespace for jobsite {uuidString}")
        namespace = f"/jobsite/{uuidString}"
        socketio.on_namespace(JobsiteNamespace(namespace))

    return app


class JobsiteNamespace(Namespace):
    def on_connect(self):
        print(f"Client connected to {self.namespace}")

    def on_disconnect(self):
        print(f"Client disconnected from {self.namespace}")