import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Usaremos Link para navegação futura
import './PedidosPage.css'; // Criaremos este arquivo para o estilo

function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // Chamamos nossa API para buscar todos os pedidos
        const response = await fetch('http://localhost:5000/api/pedidos');
        if (!response.ok) {
          throw new Error('A resposta da rede não foi OK');
        }
        const data = await response.json();
        setPedidos(data); // Guarda os pedidos no estado
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []); // O array vazio [] garante que a busca aconteça apenas uma vez

  if (loading) {
    return <p className="loading-message">Carregando pedidos...</p>;
  }

  if (error) {
    return <p className="error-message">Erro ao carregar pedidos: {error}</p>;
  }

  return (
    <div className="pedidos-container">
      <div className="admin-nav">
        <Link to="/admin/pedidos">Ver Pedidos</Link>
        <Link to="/admin/usuarios">Gerenciar Usuários</Link>
        <Link to="/admin/insumos">Gerenciar Insumos</Link>
        {/* Futuramente: <Link to="/admin/insumos">Gerenciar Insumos</Link> */}
      </div>
      <h1>Meus Pedidos de Reposição</h1>
      <div className="pedidos-list">
        <div className="pedido-header">
          <span>ID</span>
          <span>Data</span>
          <span>Viatura</span>
          <span>Status</span>
        </div>
        {pedidos.map((pedido) => (
          // Futuramente, este link levará para a página de detalhes do pedido
          <Link to={`/pedidos/${pedido.ID_Pedido}`} className="pedido-item" key={pedido.ID_Pedido}>
            <span>#{pedido.ID_Pedido}</span>
            {/* Formatamos a data para ficar mais legível */}
            <span>{new Date(pedido.Data_Hora_Solicitacao).toLocaleDateString('pt-BR')}</span>
            <span>{pedido.Placa_Ambulancia}</span>
            <span className={`status status-${pedido.Status_Pedido.toLowerCase()}`}>{pedido.Status_Pedido}</span>
          </Link>
        ))}
        {pedidos.length === 0 && <p>Nenhum pedido encontrado.</p>}
      </div>
    </div>
  );
}

export default PedidosPage;