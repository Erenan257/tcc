# backend/app/routes/checklists.py

from flask import Blueprint, request, jsonify
from app import get_db_connection
import mysql.connector

bp = Blueprint('checklists', __name__, url_prefix='/api')

# Rota para LISTAR (GET) e CRIAR (POST) checklists
@bp.route('/checklists', methods=['GET', 'POST'])
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
            cursor = conn.cursor(dictionary=True) # Usar dictionary=True para facilitar

            # 1. Inserir o registro principal do Checklist
            sql_checklist = "INSERT INTO Checklist_Diario (ID_Ambulancia, ID_Socorrista, Turno, Observacoes_Gerais, Status_Final_Ambulancia) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql_checklist, (dados['id_ambulancia'], dados['id_socorrista'], dados['turno'], dados.get('observacoes', ''), 'Revisado'))
            id_checklist_criado = cursor.lastrowid

            itens_para_reposicao = []

            # 2. Inserir cada item do checklist e verificar se precisa de reposição
            sql_item_checklist = "INSERT INTO Itens_Checklist (ID_Checklist, ID_Insumo, Status_Item, Quantidade_Reportada, Observacoes_Item) VALUES (%s, %s, %s, %s, %s)"
            for item in dados['itens']:
                if not 'id_insumo' in item or not 'quantidade' in item:
                    raise ValueError("Dados de item incompletos (precisa de id_insumo e quantidade)")

                quantidade_reportada = item['quantidade']
                
                # Busca a quantidade mínima para este insumo
                cursor.execute("SELECT Quantidade_Minima FROM Insumo WHERE ID_Insumo = %s", (item['id_insumo'],))
                insumo_info = cursor.fetchone()
                quantidade_minima = insumo_info['Quantidade_Minima'] if insumo_info else 0
                
                # Define o status com base na comparação
                status = 'Presente' if quantidade_reportada >= quantidade_minima else 'Ausente'

                cursor.execute(sql_item_checklist, (id_checklist_criado, item['id_insumo'], status, quantidade_reportada, item.get('observacao', '')))

                # 3. Se a quantidade for menor que a mínima, adiciona à lista de reposição
                if quantidade_reportada < quantidade_minima:
                    quantidade_necessaria = quantidade_minima - quantidade_reportada
                    itens_para_reposicao.append({'id_insumo': item['id_insumo'], 'quantidade': quantidade_necessaria})

            # 4. Se houver itens na lista de reposição, cria o Pedido
            if itens_para_reposicao:
                sql_pedido = "INSERT INTO Pedido_Reposicao (ID_Checklist, ID_Socorrista_Solicitante, Status_Pedido) VALUES (%s, %s, %s)"
                cursor.execute(sql_pedido, (id_checklist_criado, dados['id_socorrista'], 'Pendente'))
                id_pedido_criado = cursor.lastrowid

                sql_item_pedido = "INSERT INTO Itens_Pedido (ID_Pedido, ID_Insumo, Quantidade_Solicitada) VALUES (%s, %s, %s)"
                for item_repo in itens_para_reposicao:
                    cursor.execute(sql_item_pedido, (id_pedido_criado, item_repo['id_insumo'], item_repo['quantidade']))
            
            conn.commit()
            return jsonify({"status": "sucesso", "message": "Checklist salvo com sucesso!", "id_checklist": id_checklist_criado}), 201

        except (mysql.connector.Error, ValueError, TypeError) as err:
            if conn: conn.rollback()
            return jsonify({"status": "erro", "message": "Erro ao processar checklist.", "error": str(err)}), 500
        finally:
            if conn and conn.is_connected():
                cursor.close()
                conn.close()
