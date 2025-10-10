import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Vamos reutilizar o mesmo estilo da página de pedidos por enquanto
import './PedidosPage.css'; 

function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect para buscar os usuários da nossa API quando a página carregar
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/usuarios');
        if (!response.ok) {
          throw new Error('A resposta da rede não foi OK');
        }
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  if (loading) return <p>Carregando usuários...</p>;
  if (error) return <p>Erro ao carregar usuários: {error}</p>;

  return (
    <div className="pedidos-container"> {/* Reutilizando a classe de container */}
      <h1>Gerenciamento de Usuários</h1>
      <div className="pedidos-list">
        <div className="pedido-header">
          <span>Nome</span>
          <span>Email</span>
          <span>Perfil</span>
          <span>Status</span>
        </div>
        {usuarios.map((usuario) => (
          <div className="pedido-item" key={usuario.ID_Usuario}>
            <span>{usuario.Nome}</span>
            <span>{usuario.Email}</span>
            <span>{usuario.Perfil}</span>
            {/* Mostramos o status 'Ativo' ou 'Inativo' com base no campo is_active */}
            <span className={`status ${usuario.is_active ? 'status-atendido' : 'status-pendente'}`}>
              {usuario.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminUsuariosPage;