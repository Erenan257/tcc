import React, { useState, useEffect } from 'react';
// Reutilizaremos o estilo da página de pedidos para uma aparência consistente
import './PedidosPage.css'; 

function InventarioPage() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect para buscar os insumos da nossa API quando a página carregar
  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        // Reutilizamos a API que lista todos os insumos
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos`);
        if (!response.ok) {
          throw new Error('A resposta da rede não foi OK');
        }
        const data = await response.json();
        setInsumos(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsumos();
  }, []); // Array vazio para rodar apenas uma vez na montagem do componente

  if (loading) return <p className="loading-message">Carregando inventário padrão...</p>;
  if (error) return <p className="error-message">Erro ao carregar inventário: {error}</p>;

  return (
    <div className="pedidos-container">
      <h1>Inventário Padrão da Viatura</h1>
      <div className="pedidos-list">
        <div className="pedido-header" style={{ gridTemplateColumns: '3fr 1fr' }}>
          <span>Insumo</span>
          <span>Quantidade Mínima</span>
        </div>
        {insumos.map((insumo) => (
          <div className="pedido-item" key={insumo.ID_Insumo} style={{ gridTemplateColumns: '3fr 1fr' }}>
            <span>{insumo.Nome_Insumo}</span>
            <span>{insumo.Quantidade_Minima} {insumo.Unidade_Medida}</span>
          </div>
        ))}
        {insumos.length === 0 && <p>Nenhum insumo cadastrado no sistema.</p>}
      </div>
    </div>
  );
}

export default InventarioPage;