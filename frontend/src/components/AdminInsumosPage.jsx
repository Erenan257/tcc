import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PedidosPage.css'; // Reutilizando estilos

function AdminInsumosPage() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca os insumos da API
  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/insumos');
        if (!response.ok) { throw new Error('A resposta da rede não foi OK'); }
        const data = await response.json();
        setInsumos(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInsumos();
  }, []);

  if (loading) return <p>Carregando insumos...</p>;
  if (error) return <p>Erro ao carregar insumos: {error}</p>;

  return (
    <div className="pedidos-container">
      <div className="admin-nav">
        <Link to="/admin/pedidos">Ver Pedidos</Link>
        <Link to="/admin/usuarios">Gerenciar Usuários</Link>
        <Link to="/admin/insumos">Gerenciar Insumos</Link>
      </div>

      <div className="page-header">
        <h1>Gerenciamento de Insumos</h1>
        <Link to="/admin/insumos/novo" className="btn-new">Criar Novo Insumo</Link>
      </div>

      <div className="pedidos-list">
        <div className="pedido-header" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
          <span>Nome</span>
          <span>Unidade</span>
          <span>Qtd. Mínima</span>
          <span>Ações</span>
        </div>
        {insumos.map((insumo) => (
          <div className="pedido-item" key={insumo.ID_Insumo} style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            <span>{insumo.Nome_Insumo}</span>
            <span>{insumo.Unidade_Medida}</span>
            <span>{insumo.Quantidade_Minima}</span>
            <div className="item-actions">
              {/* Botões de ação que faremos funcionar depois */}
              <Link to={`/admin/insumos/${insumo.ID_Insumo}`} className="action-button edit">Editar</Link>
              <button className="action-button">Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminInsumosPage;