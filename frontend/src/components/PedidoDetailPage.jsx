import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PedidosPage.css'; 

function PedidoDetailPage() {
  const { id_pedido } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        // --- ALTERAÇÃO 1 AQUI ---
        // ANTES: const response = await fetch(`http://localhost:5000/api/pedidos/${id_pedido}`);
        // DEPOIS:
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/${id_pedido}`);
        
        if (!response.ok) {
          throw new Error('Pedido não encontrado');
        }
        const data = await response.json();
        setPedido(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPedido();
  }, [id_pedido]);

  const handleAtenderPedido = async () => {
    try {
      // --- ALTERAÇÃO 2 AQUI ---
      // ANTES: const response = await fetch(`http://localhost:5000/api/pedidos/${id_pedido}`, { ... });
      // DEPOIS:
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/${id_pedido}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Atendido' })
      });

      if (!response.ok) {
        throw new Error('Não foi possível atualizar o status.');
      }
      alert('Pedido marcado como "Atendido" com sucesso!');
      navigate('/admin/pedidos');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  if (loading) return <p>Carregando detalhes do pedido...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!pedido) return <p>Pedido não encontrado.</p>;

  // O JSX do return continua o mesmo
  return (
    <div className="pedidos-container">
      <h1>Detalhes do Pedido #{pedido.ID_Pedido}</h1>
      <div className="pedido-detalhes">
        <p><strong>Solicitante:</strong> {pedido.Nome_Solicitante}</p>
        <p><strong>Viatura:</strong> {pedido.Placa_Ambulancia}</p>
        <p><strong>Data:</strong> {new Date(pedido.Data_Hora_Solicitacao).toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> <span className={`status status-${pedido.Status_Pedido.toLowerCase()}`}>{pedido.Status_Pedido}</span></p>
      </div>

      <h2>Itens Solicitados</h2>
      <div className="pedidos-list">
        <div className="pedido-header" style={{gridTemplateColumns: '3fr 1fr'}}>
          <span>Insumo</span>
          <span style={{textAlign: 'center'}}>Quantidade</span>
        </div>
        {pedido.itens.map((item, index) => (
          <div className="pedido-item" key={index} style={{gridTemplateColumns: '3fr 1fr'}}>
            <span>{item.Nome_Insumo}</span>
            <span style={{textAlign: 'center'}}>{item.Quantidade_Solicitada}</span>
          </div>
        ))}
      </div>

      {pedido.Status_Pedido === 'Pendente' && (
        <button onClick={handleAtenderPedido} className="submit-button">
          Marcar como Atendido
        </button>
      )}
    </div>
  );
}

export default PedidoDetailPage;