# backend/app/__init__.py
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector

bcrypt = Bcrypt()
cors = CORS()

def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="FAmilia36#",
        database="emlog_db"
    )
    return conn

def create_app():
    app = Flask(__name__)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}) 

    # Importa os DOIS blueprints
    from .routes import auth
    from .routes import usuarios
    from .routes import insumos
    from .routes import pedidos
    
    # Registra os DOIS blueprints
    app.register_blueprint(auth.bp)
    app.register_blueprint(usuarios.bp)
    app.register_blueprint(insumos.bp)
    app.register_blueprint(checklists.bp)
    
    @app.route('/health')
    def health_check():
        return "Servidor Flask está saudável!"

    return app