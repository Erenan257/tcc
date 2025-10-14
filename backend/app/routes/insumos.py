# backend/app/routes/insumos.py

from flask import Blueprint, request, jsonify
from app import get_db_connection
import mysql.connector

bp = Blueprint('insumos', __name__, url_prefix='/api')

@bp.route('/insumos', methods=['GET', 'POST'])
def handle_insumos():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute('SELECT * FROM Insumo ORDER BY Nome_Insumo ASC')
            insumos = cursor.fetchall()
            cursor.close()
            conn.close()
            return jsonify(insumos)
        except Exception as e:
            return jsonify(message="Erro ao buscar insumos.", error=str(e)), 500

    elif request.method == 'POST':
        dados = request.get_json()
        required_fields = ['nome_insumo', 'unidade_medida', 'quantidade_minima']
        if not all(field in dados for field in required_fields):
            return jsonify({"status": "erro", "message": "Dados do insumo incompletos"}), 400
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            sql = "INSERT INTO Insumo (Nome_Insumo, Unidade_Medida, Quantidade_Minima, Descricao, Critico, Categoria) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(sql, (
                dados['nome_insumo'], dados['unidade_medida'], dados['quantidade_minima'],
                dados.get('descricao', ''), dados.get('critico', False), dados.get('categoria', '')
            ))
            conn.commit()
            id_novo_insumo = cursor.lastrowid
            cursor.close()
            conn.close()
            return jsonify({"status": "sucesso", "message": "Insumo criado com sucesso!", "id_insumo": id_novo_insumo}), 201
        except mysql.connector.Error as err:
            return jsonify({"status": "erro", "message": "Erro no banco de dados ao criar insumo.", "error": str(err)}), 500

@bp.route('/insumos/<int:id_insumo>', methods=['GET', 'PUT', 'DELETE'])
def handle_insumo_by_id(id_insumo):
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT * FROM Insumo WHERE ID_Insumo = %s", (id_insumo,))
            insumo = cursor.fetchone()
            cursor.close()
            conn.close()
            if insumo:
                return jsonify(insumo)
            else:
                return jsonify({"status": "erro", "message": "Insumo não encontrado"}), 404
        except Exception as e:
            return jsonify(message="Erro ao buscar insumo.", error=str(e)), 500

    elif request.method == 'PUT':
        dados = request.get_json()
        required_fields = ['nome_insumo', 'unidade_medida', 'quantidade_minima']
        if not all(field in dados for field in required_fields):
            return jsonify({"status": "erro", "message": "Dados do insumo incompletos"}), 400
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            sql = "UPDATE Insumo SET Nome_Insumo = %s, Unidade_Medida = %s, Quantidade_Minima = %s, Descricao = %s, Critico = %s, Categoria = %s WHERE ID_Insumo = %s"
            cursor.execute(sql, (
                dados['nome_insumo'], dados['unidade_medida'], dados['quantidade_minima'],
                dados.get('descricao', ''), dados.get('critico', False), dados.get('categoria', ''),
                id_insumo
            ))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"status": "erro", "message": "Insumo não encontrado"}), 404
            cursor.close()
            conn.close()
            return jsonify({"status": "sucesso", "message": f"Insumo com ID {id_insumo} atualizado com sucesso."})
        except mysql.connector.Error as err:
            return jsonify({"status": "erro", "message": "Erro no banco de dados ao atualizar insumo.", "error": str(err)}), 500
    
    elif request.method == 'DELETE':
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            sql = "DELETE FROM Insumo WHERE ID_Insumo = %s"
            cursor.execute(sql, (id_insumo,))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({"status": "erro", "message": "Insumo não encontrado"}), 404
            cursor.close()
            conn.close()
            return jsonify({"status": "sucesso", "message": f"Insumo com ID {id_insumo} excluído com sucesso."})
        except mysql.connector.Error as err:
            if err.errno == 1451:
                return jsonify({"status": "erro", "message": "Não é possível excluir este insumo, pois ele já está associado a checklists ou pedidos."}), 409
            return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500