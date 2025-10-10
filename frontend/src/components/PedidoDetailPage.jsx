import React, { useState, useEffect } from 'react';
// 1. Importamos useParams para ler o ID da URL e useNavigate para voltar
import { useParams, useNavigate } from 'react-router-dom';
// Reutilizaremos o CSS da página de pedidos
import './PedidosPage.css'; 

function PedidoDetailPage() {
  // 2. useParams nos dá um objeto com os parâmetros da URL. Ex: { id_pedido: '1' }
  const { id_pedido } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. useEffect busca os detalhes do pedido específico usando o ID da URL
  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/pedidos/${id_pedido}`);
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
  }, [id_pedido]); // O efeito roda novamente se o id_pedido mudar

  // Função para marcar o pedido como atendido
  const handleAtenderPedido = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pedidos/${id_pedido}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Atendido' })
      });
      if (!response.ok) {
        throw new Error('Não foi possível atualizar o status.');
      }
      alert('Pedido marcado como "Atendido" com sucesso!');
      navigate('/admin/pedidos'); // Volta para a lista de pedidos
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  if (loading) return <p>Carregando detalhes do pedido...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!pedido) return <p>Pedido não encontrado.</p>;

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
        <div className="pedido-header">
          <span>Insumo</span>
          <span>Quantidade</span>
        </div>
        {pedido.itens.map((item, index) => (
          <div className="pedido-item" key={index}>
            <span>{item.Nome_Insumo}</span>
            <span>{item.Quantidade_Solicitada}</span>
          </div>
        ))}
      </div>

      {/* O botão de atender só aparece se o pedido estiver pendente */}
      {pedido.Status_Pedido === 'Pendente' && (
        <button onClick={handleAtenderPedido} className="submit-button">
          Marcar como Atendido
        </button>
      )}
    </div>
  );
}

export default PedidoDetailPage;