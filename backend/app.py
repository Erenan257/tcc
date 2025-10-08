import mysql.connector
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

app.config['MYSQL_PASSWORD'] = "FAmilia36#"

bcrypt = Bcrypt(app)

# --- LÓGICA DE CONEXÃO ATUALIZADA PARA MYSQL ---
def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="FAmilia36#",  # <-- COLOQUE A SENHA QUE VOCÊ DEFINIU AQUI
        database="emlog_db"
    )
    return conn

# --- ROTAS DA APLICAÇÃO ---

@app.route('/')
def index():
    return "<h1>Servidor Back-end do E-MedLog está no ar!</h1>"

@app.route('/api/teste-db')
def teste_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'emlog_db'")
        tables = cursor.fetchall()
        cursor.close()
        conn.close()
        # A resposta do MySQL é uma lista de tuplas, então precisamos extrair o primeiro item de cada tupla
        table_names = [table[0] for table in tables]
        return jsonify(message="Conexão com o banco de dados MySQL bem-sucedida!", tables=table_names)
    except Exception as e:
        return jsonify(message="Erro ao conectar com o banco de dados.", error=str(e)), 500

# --- ROTA DE LOGIN ATUALIZADA COM VERIFICAÇÃO DE USUÁRIO ATIVO ---
@app.route('/api/login', methods=['POST'])
def login():
    dados = request.get_json()
    if not dados or not 'email' in dados or not 'senha' in dados:
        return jsonify({"status": "erro", "message": "Dados de login ausentes"}), 400

    email = dados['email']
    senha_texto_puro = dados['senha']

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # AQUI ESTÁ A MUDANÇA: Adicionamos a condição para buscar apenas usuários ativos
        sql = "SELECT * FROM Usuario WHERE Email = %s AND is_active = TRUE"
        cursor.execute(sql, (email,))
        usuario = cursor.fetchone()
        
        cursor.close()
        conn.close()

        # Compara o hash do banco com a senha enviada
        if usuario and bcrypt.check_password_hash(usuario['Senha_Criptografada'], senha_texto_puro):
            # Remove a senha e o status de ativo da resposta por segurança e clareza
            del usuario['Senha_Criptografada']
            del usuario['is_active']
            
            return jsonify({
                "status": "sucesso",
                "message": "Login bem-sucedido!",
                "usuario": usuario
            })
        else:
            # A mensagem de erro é a mesma para não dar pistas (se o email existe ou se o usuário está inativo)
            return jsonify({"status": "erro", "message": "E-mail ou senha inválidos"}), 401
            
    except Exception as e:
        return jsonify(message="Erro interno no servidor.", error=str(e)), 500

# --- ROTAS PARA CRUD DE INSUMOS ---
# --- NOVA ROTA PARA BUSCAR INSUMOS ---
@app.route('/api/insumos', methods=['GET'])
def get_insumos():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute('SELECT ID_Insumo, Nome_Insumo, Unidade_Medida, Quantidade_Minima, Critico FROM Insumo ORDER BY Nome_Insumo ASC')
        insumos = cursor.fetchall()
        
        cursor.close()
        conn.close()

        return jsonify(insumos)
    except Exception as e:
        return jsonify(message="Erro interno no servidor ao buscar insumos.", error=str(e)), 500

# --- NOVA ROTA PARA CRIAR UM NOVO INSUMO ---
@app.route('/api/insumos', methods=['POST'])
def criar_insumo():
    # FUTURAMENTE: Proteger esta rota para que apenas gestores possam usar.
    dados = request.get_json()

    required_fields = ['nome_insumo', 'unidade_medida', 'quantidade_minima']
    if not all(field in dados for field in required_fields):
        return jsonify({"status": "erro", "message": "Dados do insumo incompletos"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
            INSERT INTO Insumo (Nome_Insumo, Unidade_Medida, Quantidade_Minima, Descricao, Critico, Categoria)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            dados['nome_insumo'],
            dados['unidade_medida'],
            dados['quantidade_minima'],
            dados.get('descricao', ''),  # .get() para campos opcionais
            dados.get('critico', False),
            dados.get('categoria', '')
        ))
        conn.commit()
        
        id_novo_insumo = cursor.lastrowid
        cursor.close()
        conn.close()

        return jsonify({"status": "sucesso", "message": "Insumo criado com sucesso!", "id_insumo": id_novo_insumo}), 201

    except mysql.connector.Error as err:
        return jsonify({"status": "erro", "message": "Erro no banco de dados ao criar insumo.", "error": str(err)}), 500

# --- ROTA PARA EDITAR UM INSUMO EXISTENTE ---
@app.route('/api/insumos/<int:id_insumo>', methods=['PUT'])
def atualizar_insumo(id_insumo):
    # FUTURAMENTE: Proteger esta rota.
    dados = request.get_json()

    required_fields = ['nome_insumo', 'unidade_medida', 'quantidade_minima']
    if not all(field in dados for field in required_fields):
        return jsonify({"status": "erro", "message": "Dados do insumo incompletos"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = """
            UPDATE Insumo SET 
                Nome_Insumo = %s, Unidade_Medida = %s, Quantidade_Minima = %s, 
                Descricao = %s, Critico = %s, Categoria = %s
            WHERE ID_Insumo = %s
        """
        cursor.execute(sql, (
            dados['nome_insumo'],
            dados['unidade_medida'],
            dados['quantidade_minima'],
            dados.get('descricao', ''),
            dados.get('critico', False),
            dados.get('categoria', ''),
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

# --- ROTA PARA EXCLUIR UM INSUMO ---
@app.route('/api/insumos/<int:id_insumo>', methods=['DELETE'])
def deletar_insumo(id_insumo):
    # FUTURAMENTE: Proteger esta rota.
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
        # Erro de chave estrangeira: o insumo está em uso em um checklist/pedido.
        if err.errno == 1451:
            return jsonify({"status": "erro", "message": "Não é possível excluir este insumo, pois ele já está associado a checklists ou pedidos."}), 409 # Conflict
        return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500

# --- NOVA ROTA PARA SUBMETER UM CHECKLIST ---
@app.route('/api/checklists', methods=['POST'])
def criar_checklist():
    dados = request.get_json()

    # Validação básica dos dados recebidos
    required_fields = ['id_ambulancia', 'id_socorrista', 'turno', 'itens']
    if not all(field in dados for field in required_fields):
        return jsonify({"status": "erro", "message": "Dados incompletos"}), 400

    conn = None # Inicializa a conexão como nula
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. Inserir o registro principal na tabela Checklist_Diario
        sql_checklist = """
            INSERT INTO Checklist_Diario (ID_Ambulancia, ID_Socorrista, Turno, Observacoes_Gerais, Status_Final_Ambulancia)
            VALUES (%s, %s, %s, %s, %s)
        """
        # Usamos .get() para pegar a observação, caso ela não seja enviada
        observacoes = dados.get('observacoes', '') 
        # Podemos adicionar uma lógica para definir o status, por enquanto será 'Revisado'
        status_ambulancia = 'Revisado' 
        
        cursor.execute(sql_checklist, (
            dados['id_ambulancia'],
            dados['id_socorrista'],
            dados['turno'],
            observacoes,
            status_ambulancia
        ))

        # 2. Obter o ID do checklist que acabamos de criar
        id_checklist_criado = cursor.lastrowid

        # 3. Inserir cada item do checklist na tabela Itens_Checklist
        sql_item_checklist = """
            INSERT INTO Itens_Checklist (ID_Checklist, ID_Insumo, Status_Item, Observacoes_Item)
            VALUES (%s, %s, %s, %s)
        """
        for item in dados['itens']:
            # Validação para cada item
            if not all(field in item for field in ['id_insumo', 'status']):
                raise ValueError("Dados de item incompletos")

            observacao_item = item.get('observacao', '')
            cursor.execute(sql_item_checklist, (
                id_checklist_criado,
                item['id_insumo'],
                item['status'],
                observacao_item
            ))

        #teste
        # 3. Filtrar apenas os itens que estão ausentes para criar um pedido
        itens_faltantes = [item for item in dados['itens'] if item.get('status', '').lower() != 'presente']

        if itens_faltantes:
            # 4. Se houver itens faltantes, cria um registro em Pedido_Reposicao
            sql_pedido = """
                INSERT INTO Pedido_Reposicao (ID_Checklist, ID_Socorrista_Solicitante, Status_Pedido)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql_pedido, (
                id_checklist_criado,
                dados['id_socorrista'],
                'Pendente'  # Status inicial do pedido
            ))
            id_pedido_criado = cursor.lastrowid

            # 5. Insere cada item faltante na tabela Itens_Pedido
            sql_item_pedido = """
                INSERT INTO Itens_Pedido (ID_Pedido, ID_Insumo, Quantidade_Solicitada)
                VALUES (%s, %s, %s)
            """
            for item in itens_faltantes:
                # A quantidade solicitada pode vir do front-end ou podemos definir um padrão.
                # Por enquanto, vamos solicitar 1 unidade como padrão.
                quantidade = item.get('quantidade_solicitada', 1)
                cursor.execute(sql_item_pedido, (
                    id_pedido_criado,
                    item['id_insumo'],
                    quantidade
                ))

        # 4. Se tudo deu certo até aqui, efetiva a transação
        conn.commit()

        return jsonify({"status": "sucesso", "message": "Checklist salvo com sucesso!", "id_checklist": id_checklist_criado}), 201

    except mysql.connector.Error as err:
        # Se ocorrer um erro no banco de dados, desfaz a transação
        if conn:
            conn.rollback()
        return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500
    except ValueError as err:
        # Se ocorrer um erro na validação dos dados, desfaz a transação
        if conn:
            conn.rollback()
        return jsonify({"status": "erro", "message": str(err)}), 400
    finally:
        # Garante que a conexão seja sempre fechada
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# --- NOVA ROTA PARA LISTAR OS CHECKLISTS ---
@app.route('/api/checklists', methods=['GET'])
def get_checklists():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Usamos JOIN para buscar dados de tabelas relacionadas (Usuario e Ambulancia)
        # e deixar nossa resposta da API mais completa.
        sql = """
            SELECT
                ck.ID_Checklist,
                ck.Data_Hora_Preenchimento,
                ck.Turno,
                ck.Status_Final_Ambulancia,
                usr.Nome as Nome_Socorrista,
                amb.Placa as Placa_Ambulancia
            FROM Checklist_Diario ck
            JOIN Usuario usr ON ck.ID_Socorrista = usr.ID_Usuario
            JOIN Ambulancia amb ON ck.ID_Ambulancia = amb.ID_Ambulancia
            ORDER BY ck.Data_Hora_Preenchimento DESC
        """

        cursor.execute(sql)
        checklists = cursor.fetchall()

        cursor.close()
        conn.close()

        # O MySQL retorna datas como objetos. Convertemos para string para ser compatível com JSON.
        for checklist in checklists:
            checklist['Data_Hora_Preenchimento'] = checklist['Data_Hora_Preenchimento'].isoformat()

        return jsonify(checklists)
    except Exception as e:
        return jsonify(message="Erro interno no servidor ao buscar checklists.", error=str(e)), 500

# --- NOVA ROTA PARA LISTAR OS PEDIDOS DE REPOSIÇÃO ---
@app.route('/api/pedidos', methods=['GET'])
def get_pedidos():
    try:
        # Pega o parâmetro 'status' da URL, se ele existir. Ex: /api/pedidos?status=pendente
        status_filtro = request.args.get('status')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # A base da nossa consulta SQL com JOINs para pegar dados relevantes
        sql = """
            SELECT 
                p.ID_Pedido,
                p.Status_Pedido,
                p.Data_Hora_Solicitacao,
                u.Nome as Nome_Solicitante,
                a.Placa as Placa_Ambulancia
            FROM Pedido_Reposicao p
            JOIN Usuario u ON p.ID_Socorrista_Solicitante = u.ID_Usuario
            JOIN Checklist_Diario c ON p.ID_Checklist = c.ID_Checklist
            JOIN Ambulancia a ON c.ID_Ambulancia = a.ID_Ambulancia
        """
        params = []

        # Adiciona um filtro WHERE na consulta se o parâmetro 'status' foi fornecido
        if status_filtro:
            sql += " WHERE p.Status_Pedido = %s"
            params.append(status_filtro)
        
        sql += " ORDER BY p.Data_Hora_Solicitacao DESC"

        cursor.execute(sql, params)
        pedidos = cursor.fetchall()

        cursor.close()
        conn.close()

        # Converte as datas para um formato JSON amigável
        for pedido in pedidos:
            pedido['Data_Hora_Solicitacao'] = pedido['Data_Hora_Solicitacao'].isoformat()

        return jsonify(pedidos)

    except Exception as e:
        return jsonify(message="Erro interno no servidor ao buscar pedidos.", error=str(e)), 500

# --- NOVA ROTA PARA VER OS DETALHES DE UM ÚNICO PEDIDO ---
@app.route('/api/pedidos/<int:id_pedido>', methods=['GET'])
def get_pedido_detalhes(id_pedido):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Query 1: Pega os detalhes principais do pedido
        sql_pedido = """
            SELECT 
                p.ID_Pedido, p.Status_Pedido, p.Data_Hora_Solicitacao,
                u.Nome as Nome_Solicitante, a.Placa as Placa_Ambulancia
            FROM Pedido_Reposicao p
            JOIN Usuario u ON p.ID_Socorrista_Solicitante = u.ID_Usuario
            JOIN Checklist_Diario c ON p.ID_Checklist = c.ID_Checklist
            JOIN Ambulancia a ON c.ID_Ambulancia = a.ID_Ambulancia
            WHERE p.ID_Pedido = %s
        """
        cursor.execute(sql_pedido, (id_pedido,))
        pedido = cursor.fetchone()

        if not pedido:
            return jsonify({"status": "erro", "message": "Pedido não encontrado"}), 404

        # Query 2: Pega os itens associados a este pedido
        sql_itens = """
            SELECT 
                i.Nome_Insumo, ip.Quantidade_Solicitada
            FROM Itens_Pedido ip
            JOIN Insumo i ON ip.ID_Insumo = i.ID_Insumo
            WHERE ip.ID_Pedido = %s
        """
        cursor.execute(sql_itens, (id_pedido,))
        itens = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Adiciona a lista de itens ao dicionário do pedido
        pedido['itens'] = itens
        pedido['Data_Hora_Solicitacao'] = pedido['Data_Hora_Solicitacao'].isoformat()

        return jsonify(pedido)

    except Exception as e:
        return jsonify(message="Erro interno no servidor ao buscar detalhes do pedido.", error=str(e)), 500

# --- NOVA ROTA PARA ATUALIZAR O STATUS DE UM PEDIDO ---
@app.route('/api/pedidos/<int:id_pedido>', methods=['PATCH'])
def atualizar_status_pedido(id_pedido):
    dados = request.get_json()

    # Validação para garantir que o novo status foi enviado
    if not dados or 'status' not in dados:
        return jsonify({"status": "erro", "message": "Novo status não foi fornecido"}), 400

    novo_status = dados['status']
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Executa o comando UPDATE no banco de dados
        sql = "UPDATE Pedido_Reposicao SET Status_Pedido = %s WHERE ID_Pedido = %s"
        cursor.execute(sql, (novo_status, id_pedido))
        
        # Confirma a transação
        conn.commit()

        # Verifica se alguma linha foi realmente atualizada
        if cursor.rowcount == 0:
            return jsonify({"status": "erro", "message": "Pedido não encontrado"}), 404

        cursor.close()
        conn.close()

        return jsonify({"status": "sucesso", "message": f"Status do pedido {id_pedido} atualizado para '{novo_status}'."})

    except Exception as e:
        return jsonify(message="Erro interno no servidor ao atualizar o pedido.", error=str(e)), 500

# --- 3. NOVA ROTA PARA REGISTRAR USUÁRIOS ---
@app.route('/api/usuarios/registrar', methods=['POST'])
def registrar_usuario():
    dados = request.get_json()
    
    required_fields = ['nome', 'email', 'senha', 'perfil']
    if not all(field in dados for field in required_fields):
        return jsonify({"status": "erro", "message": "Dados de registro incompletos"}), 400

    nome = dados['nome']
    email = dados['email']
    senha_texto_puro = dados['senha']
    perfil = dados['perfil']

    # Gera o hash da senha
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
        # Erro de email duplicado
        if err.errno == 1062:
             return jsonify({"status": "erro", "message": "Este e-mail já está em uso."}), 409
        return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500

# --- NOVA ROTA PARA GESTOR LISTAR USUÁRIOS ---
@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    # FUTURAMENTE: Adicionaremos aqui uma verificação para garantir que apenas um 'Gestor' pode acessar esta rota.
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Selecionamos os campos importantes, EXCLUINDO a senha.
        sql = "SELECT ID_Usuario, Nome, Email, Perfil, Matricula_Empresa, CPF FROM Usuario WHERE is_active = TRUE ORDER BY Nome ASC"
        cursor.execute(sql)
        usuarios = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(usuarios)

    except Exception as e:
        return jsonify(message="Erro interno no servidor ao buscar usuários.", error=str(e)), 500

# --- NOVA ROTA PARA GESTOR CRIAR UM NOVO USUÁRIO ---
@app.route('/api/usuarios', methods=['POST'])
def criar_usuario():
    # FUTURAMENTE: Adicionaremos aqui uma verificação para garantir que apenas um 'Gestor' pode acessar esta rota.
    dados = request.get_json()
    
    required_fields = ['nome', 'email', 'senha', 'perfil']
    if not all(field in dados for field in required_fields):
        return jsonify({"status": "erro", "message": "Dados de registro incompletos"}), 400

    nome = dados['nome']
    email = dados['email']
    senha_texto_puro = dados['senha']
    perfil = dados['perfil']

    # Gera o hash da senha, reutilizando nossa lógica segura
    hash_senha = bcrypt.generate_password_hash(senha_texto_puro).decode('utf-8')

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = "INSERT INTO Usuario (Nome, Email, Senha_Criptografada, Perfil) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (nome, email, hash_senha, perfil))
        conn.commit()
        
        id_novo_usuario = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({"status": "sucesso", "message": "Usuário criado com sucesso!", "id_usuario": id_novo_usuario}), 201
    
    except mysql.connector.Error as err:
        # Erro de email duplicado
        if err.errno == 1062:
             return jsonify({"status": "erro", "message": "Este e-mail já está em uso."}), 409
        return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500

# --- NOVA ROTA PARA GESTOR EDITAR UM USUÁRIO ---
@app.route('/api/usuarios/<int:id_usuario>', methods=['PUT'])
def atualizar_usuario(id_usuario):
    # FUTURAMENTE: Proteger esta rota para que apenas gestores possam editar usuários.
    dados = request.get_json()

    required_fields = ['nome', 'email', 'perfil']
    if not all(field in dados for field in required_fields):
        return jsonify({"status": "erro", "message": "Dados de atualização incompletos"}), 400

    nome = dados['nome']
    email = dados['email']
    perfil = dados['perfil']
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = "UPDATE Usuario SET Nome = %s, Email = %s, Perfil = %s WHERE ID_Usuario = %s"
        cursor.execute(sql, (nome, email, perfil, id_usuario))
        
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "erro", "message": "Usuário não encontrado"}), 404

        cursor.close()
        conn.close()

        return jsonify({"status": "sucesso", "message": f"Usuário com ID {id_usuario} atualizado com sucesso."})

    except mysql.connector.Error as err:
        # Erro de email duplicado
        if err.errno == 1062:
             return jsonify({"status": "erro", "message": "Este e-mail já está em uso por outro usuário."}), 409
        return jsonify({"status": "erro", "message": "Erro no banco de dados.", "error": str(err)}), 500

# --- ROTA ATUALIZADA PARA INATIVAR UM USUÁRIO (SOFT DELETE) ---
@app.route('/api/usuarios/<int:id_usuario>', methods=['DELETE'])
def deletar_usuario(id_usuario):
    # FUTURAMENTE: Proteger esta rota.
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Em vez de DELETAR, nós ATUALIZAMOS o status do usuário para inativo.
        sql = "UPDATE Usuario SET is_active = FALSE WHERE ID_Usuario = %s"
        cursor.execute(sql, (id_usuario,))
        
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "erro", "message": "Usuário não encontrado"}), 404

        cursor.close()
        conn.close()

        return jsonify({"status": "sucesso", "message": f"Usuário com ID {id_usuario} foi inativado."})

    except Exception as e:
        return jsonify(message="Erro interno no servidor ao inativar o usuário.", error=str(e)), 500

# --- NOVA ROTA PARA ATUALIZAR PARCIALMENTE UM USUÁRIO (EX: REATIVAR) ---
@app.route('/api/usuarios/<int:id_usuario>', methods=['PATCH'])
def atualizar_parcial_usuario(id_usuario):
    # FUTURAMENTE: Proteger esta rota para que apenas gestores possam usar.
    dados = request.get_json()

    if not dados or 'is_active' not in dados:
        return jsonify({"status": "erro", "message": "Nenhuma ação de status fornecida (ex: {'is_active': true})"}), 400

    is_active = bool(dados['is_active'])

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sql = "UPDATE Usuario SET is_active = %s WHERE ID_Usuario = %s"
        cursor.execute(sql, (is_active, id_usuario))
        
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"status": "erro", "message": "Usuário não encontrado"}), 404

        cursor.close()
        conn.close()

        status_texto = "reativado" if is_active else "inativado"
        return jsonify({"status": "sucesso", "message": f"Usuário com ID {id_usuario} foi {status_texto}."})

    except Exception as e:
        return jsonify(message="Erro interno no servidor ao atualizar o usuário.", error=str(e)), 500

# Bloco de execução principal
if __name__ == '__main__':
    app.run(debug=True)

