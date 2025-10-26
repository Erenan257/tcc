# backend/app/routes/auth.py

from flask import Blueprint, request, jsonify
from app import bcrypt, get_db_connection
import mysql.connector

# O prefixo /api será adicionado antes de /login e /registrar
bp = Blueprint('auth', __name__, url_prefix='/api')

@bp.route('/api/login', methods=['POST'])
def login():
    dados = request.get_json()
    if not dados or not 'email' in dados or not 'senha' in dados:
        return jsonify({"status": "erro", "message": "Dados de login ausentes"}), 400

    email = dados['email']
    senha_texto_puro = dados['senha']
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM Usuario WHERE Email = %s AND is_active = TRUE"
        cursor.execute(sql, (email,))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()

        if usuario and bcrypt.check_password_hash(usuario['Senha_Criptografada'], senha_texto_puro):
            del usuario['Senha_Criptografada']
            del usuario['is_active']
            return jsonify({
                "status": "sucesso",
                "message": "Login bem-sucedido!",
                "usuario": usuario
            })
        else:
            return jsonify({"status": "erro", "message": "E-mail ou senha inválidos"}), 401
    except Exception as e:
        return jsonify(message="Erro interno no servidor.", error=str(e)), 500

@bp.route('/registrar', methods=['POST'])
def registrar_usuario():
    dados = request.get_json()
    required_fields = ['nome', 'email', 'senha', 'perfil']
    if not all(field in dados for field in required_fields):
        return jsonify({"status": "erro", "message": "Dados de registro incompletos"}), 400

    nome = dados['nome'].title()
    email = dados['email']
    senha_texto_puro = dados['senha']
    perfil = dados['perfil'].capitalize()

    hash_senha = bcrypt.generate_password_hash(senha_texto_puro).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO Usuario (Nome, Email, Senha_Criptografada, Perfil) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (nome, email, hash_senha, perfil))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"status": "sucesso", "message": "Usuário registrado com sucesso!"}), 201
    except mysql.connector.Error as err:
        if err.errno == 1062:
             return jsonify({"status": "erro", "message": "Este e-mail já está em uso."}), 409
        return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500