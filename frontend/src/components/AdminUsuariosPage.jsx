import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PedidosPage.css';

function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    try {
      // --- ALTERAÇÃO 1 AQUI ---
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`);
      if (!response.ok) { throw new Error('A resposta da rede não foi OK'); }
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleToggleStatus = async (usuarioId, currentStatus) => {
    const isAtivando = !currentStatus;
    const method = isAtivando ? 'PATCH' : 'DELETE';
    // --- ALTERAÇÃO 2 AQUI ---
    const url = `${import.meta.env.VITE_API_URL}/api/usuarios/${usuarioId}`;

    if (!window.confirm(`Tem certeza que deseja ${isAtivando ? 'reativar' : 'inativar'} este usuário?`)) {
      return;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: isAtivando ? JSON.stringify({ is_active: true }) : null,
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchUsuarios();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert(`Erro ao atualizar status: ${err.message}`);
    }
  };

  if (loading) return <p>Carregando usuários...</p>;
  if (error) return <p>Erro ao carregar usuários: {error}</p>;

  return (
    <div className="pedidos-container">
      <div className="admin-nav">
        <Link to="/admin/pedidos">Ver Pedidos</Link>
        <Link to="/admin/usuarios">Gerenciar Usuários</Link>
        <Link to="/admin/insumos">Gerenciar Insumos</Link>
      </div>
      <div className="page-header">
        <h1>Gerenciamento de Usuários</h1>
        <Link to="/admin/usuarios/novo" className="btn-new">Criar Novo Usuário</Link>
      </div>
      <div className="pedidos-list">
        <div className="pedido-header" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
          <span>Nome</span>
          <span>Email</span>
          <span>Perfil</span>
          <span>Status</span>
          <span>Ações</span>
        </div>
        {usuarios.map((usuario) => (
            <div className="pedido-item" key={usuario.ID_Usuario} style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
              <span>{usuario.Nome}</span>
              <span>{usuario.Email}</span>
              <span>{usuario.Perfil}</span>
              <span className={`status ${usuario.is_active ? 'status-atendido' : 'status-pendente'}`}>
                {usuario.is_active ? 'Ativo' : 'Inativo'}
              </span>
            <div className="item-actions">
              <Link to={`/admin/usuarios/${usuario.ID_Usuario}`} className="action-button edit">
                Editar
              </Link>
              <button onClick={() => handleToggleStatus(usuario.ID_Usuario, usuario.is_active)} className="action-button">
                {usuario.is_active ? 'Inativar' : 'Reativar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminUsuariosPage;