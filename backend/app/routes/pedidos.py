# backend/app/routes/pedidos.py

from flask import Blueprint, request, jsonify
from app import get_db_connection
import mysql.connector

bp = Blueprint('pedidos', __name__, url_prefix='/api/pedidos')

# Rota para LISTAR todos os pedidos (com filtro opcional)
@bp.route('/', methods=['GET'])
def get_pedidos():
    try:
        status_filtro = request.args.get('status')
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        sql = """SELECT p.ID_Pedido, p.Status_Pedido, p.Data_Hora_Solicitacao,
                        u.Nome as Nome_Solicitante, a.Placa as Placa_Ambulancia
                 FROM Pedido_Reposicao p
                 JOIN Usuario u ON p.ID_Socorrista_Solicitante = u.ID_Usuario
                 JOIN Checklist_Diario c ON p.ID_Checklist = c.ID_Checklist
                 JOIN Ambulancia a ON c.ID_Ambulancia = a.ID_Ambulancia"""
        params = []
        if status_filtro:
            sql += " WHERE p.Status_Pedido = %s"
            params.append(status_filtro)
        sql += " ORDER BY p.Data_Hora_Solicitacao DESC"
        cursor.execute(sql, params)
        pedidos = cursor.fetchall()
        cursor.close()
        conn.close()
        for pedido in pedidos:
            if pedido['Data_Hora_Solicitacao']:
                pedido['Data_Hora_Solicitacao'] = pedido['Data_Hora_Solicitacao'].isoformat()
        return jsonify(pedidos)
    except Exception as e:
        return jsonify(message="Erro ao buscar pedidos.", error=str(e)), 500

# Rota para DETALHAR (GET) e ATUALIZAR (PATCH) um pedido
@bp.route('/<int:id_pedido>', methods=['GET', 'PATCH'])
def handle_pedido_by_id(id_pedido):
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            sql_pedido = """SELECT p.ID_Pedido, p.Status_Pedido, p.Data_Hora_Solicitacao, u.Nome as Nome_Solicitante, a.Placa as Placa_Ambulancia
                            FROM Pedido_Reposicao p
                            JOIN Usuario u ON p.ID_Socorrista_Solicitante = u.ID_Usuario
                            JOIN Checklist_Diario c ON p.ID_Checklist = c.ID_Checklist
                            JOIN Ambulancia a ON c.ID_Ambulancia = a.ID_Ambulancia
                            WHERE p.ID_Pedido = %s"""
            cursor.execute(sql_pedido, (id_pedido,))
            pedido = cursor.fetchone()
            if not pedido: return jsonify({"status": "erro", "message": "Pedido não encontrado"}), 404
            
            sql_itens = """SELECT i.Nome_Insumo, ip.Quantidade_Solicitada
                           FROM Itens_Pedido ip JOIN Insumo i ON ip.ID_Insumo = i.ID_Insumo
                           WHERE ip.ID_Pedido = %s"""
            cursor.execute(sql_itens, (id_pedido,))
            itens = cursor.fetchall()
            cursor.close()
            conn.close()
            
            pedido['itens'] = itens
            if pedido['Data_Hora_Solicitacao']: pedido['Data_Hora_Solicitacao'] = pedido['Data_Hora_Solicitacao'].isoformat()
            return jsonify(pedido)
        except Exception as e:
            return jsonify(message="Erro ao buscar detalhes do pedido.", error=str(e)), 500

    elif request.method == 'PATCH':
        dados = request.get_json()
        if not dados or 'status' not in dados: return jsonify({"status": "erro", "message": "Novo status não fornecido"}), 400
        novo_status = dados['status']
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            sql = "UPDATE Pedido_Reposicao SET Status_Pedido = %s WHERE ID_Pedido = %s"
            cursor.execute(sql, (novo_status, id_pedido))
            conn.commit()
            if cursor.rowcount == 0: return jsonify({"status": "erro", "message": "Pedido não encontrado"}), 404
            cursor.close()
            conn.close()
            return jsonify({"status": "sucesso", "message": f"Status do pedido {id_pedido} atualizado."})
        except Exception as e:
            return jsonify(message="Erro ao atualizar o pedido.", error=str(e)), 500