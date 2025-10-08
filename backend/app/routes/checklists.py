# backend/app/routes/checklists.py

from flask import Blueprint, request, jsonify
from app import get_db_connection
import mysql.connector

bp = Blueprint('checklists', __name__, url_prefix='/api/checklists')

# Rota para LISTAR (GET) e CRIAR (POST) checklists
@bp.route('/', methods=['GET', 'POST'])
def handle_checklists():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            sql = """
                SELECT ck.ID_Checklist, ck.Data_Hora_Preenchimento, ck.Turno, ck.Status_Final_Ambulancia,
                       usr.Nome as Nome_Socorrista, amb.Placa as Placa_Ambulancia
                FROM Checklist_Diario ck
                JOIN Usuario usr ON ck.ID_Socorrista = usr.ID_Usuario
                JOIN Ambulancia amb ON ck.ID_Ambulancia = amb.ID_Ambulancia
                ORDER BY ck.Data_Hora_Preenchimento DESC
            """
            cursor.execute(sql)
            checklists = cursor.fetchall()
            cursor.close()
            conn.close()
            for checklist in checklists:
                if checklist['Data_Hora_Preenchimento']:
                    checklist['Data_Hora_Preenchimento'] = checklist['Data_Hora_Preenchimento'].isoformat()
            return jsonify(checklists)
        except Exception as e:
            return jsonify(message="Erro ao buscar checklists.", error=str(e)), 500
    
    elif request.method == 'POST':
        dados = request.get_json()
        required_fields = ['id_ambulancia', 'id_socorrista', 'turno', 'itens']
        if not all(field in dados for field in required_fields):
            return jsonify({"status": "erro", "message": "Dados incompletos"}), 400
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            sql_checklist = "INSERT INTO Checklist_Diario (ID_Ambulancia, ID_Socorrista, Turno, Observacoes_Gerais, Status_Final_Ambulancia) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql_checklist, (
                dados['id_ambulancia'], dados['id_socorrista'], dados['turno'],
                dados.get('observacoes', ''), 'Revisado'
            ))
            id_checklist_criado = cursor.lastrowid
            
            sql_item_checklist = "INSERT INTO Itens_Checklist (ID_Checklist, ID_Insumo, Status_Item, Observacoes_Item) VALUES (%s, %s, %s, %s)"
            for item in dados['itens']:
                if not all(field in item for field in ['id_insumo', 'status']): raise ValueError("Dados de item incompletos")
                cursor.execute(sql_item_checklist, (id_checklist_criado, item['id_insumo'], item['status'], item.get('observacao', '')))

            itens_faltantes = [item for item in dados['itens'] if item.get('status', '').lower() != 'presente']
            if itens_faltantes:
                sql_pedido = "INSERT INTO Pedido_Reposicao (ID_Checklist, ID_Socorrista_Solicitante, Status_Pedido) VALUES (%s, %s, %s)"
                cursor.execute(sql_pedido, (id_checklist_criado, dados['id_socorrista'], 'Pendente'))
                id_pedido_criado = cursor.lastrowid

                sql_item_pedido = "INSERT INTO Itens_Pedido (ID_Pedido, ID_Insumo, Quantidade_Solicitada) VALUES (%s, %s, %s)"
                for item in itens_faltantes:
                    cursor.execute(sql_item_pedido, (id_pedido_criado, item['id_insumo'], item.get('quantidade_solicitada', 1)))
            
            conn.commit()
            return jsonify({"status": "sucesso", "message": "Checklist salvo!", "id_checklist": id_checklist_criado}), 201
        except (mysql.connector.Error, ValueError) as err:
            if conn: conn.rollback()
            return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()