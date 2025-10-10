import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChecklistPage.css';

function ChecklistPage() {
  const [insumos, setInsumos] = useState([]);
  // 1. O estado agora guarda as QUANTIDADES, não mais o status de texto.
  const [itemQuantities, setItemQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // ... (a lógica do useEffect para buscar os insumos continua exatamente a mesma)
    const fetchInsumos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos`);
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

  // 2. Nova função para lidar com a mudança na quantidade de um item
  const handleQuantityChange = (insumoId, quantidade) => {
    // Garante que a quantidade não seja negativa
    const novaQuantidade = Math.max(0, parseInt(quantidade, 10) || 0);
    setItemQuantities(prevQuantities => ({
      ...prevQuantities,
      [insumoId]: novaQuantidade
    }));
  };
  
  // 3. Função handleSubmit atualizada para enviar o novo formato de dados
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Transforma nosso objeto de quantidades no array que a API espera
    const itensArray = insumos.map(insumo => ({
      id_insumo: insumo.ID_Insumo,
      // Se um item não foi tocado, sua quantidade é 0
      quantidade: itemQuantities[insumo.ID_Insumo] || 0
    }));

    const checklistPayload = {
      id_ambulancia: 1, 
      id_socorrista: 1, 
      turno: "Noite",
      itens: itensArray
    };

    try {
      // --- AQUI ESTÁ A CORREÇÃO ---
      // Todas as opções (method, headers, body) devem estar DENTRO do mesmo objeto {}
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklistPayload)
      }); // O objeto de opções e a chamada do fetch terminam aqui
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Checklist quantitativo enviado com sucesso!');
        navigate('/dashboard'); 
      } else {
        alert(`Erro ao enviar checklist: ${data.message}`);
      }
    } catch (error) {
      alert('Erro de conexão ao enviar o checklist.');
      console.error(error);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  // 4. JSX ATUALIZADO: trocamos os botões por um input numérico
  return (
    <div className="checklist-container">
      <form className="checklist-form" onSubmit={handleSubmit}>
        <h1>Checklist de Insumos da Viatura</h1>
        <div className="checklist-header">
          <span>Insumo</span>
          <span>Quantidade Encontrada</span>
        </div>

        {insumos.map((insumo) => (
          <div className="checklist-item" key={insumo.ID_Insumo}>
            <span className="item-name">{insumo.Nome_Insumo} (Mín: {insumo.Quantidade_Minima})</span>
            <div className="item-actions">
              <input
                type="number"
                className="quantity-input"
                min="0"
                // O valor do input é o que está no nosso estado, ou uma string vazia
                value={itemQuantities[insumo.ID_Insumo] || ''}
                onChange={(e) => handleQuantityChange(insumo.ID_Insumo, e.target.value)}
                placeholder="Qtd."
              />
            </div>
          </div>
        ))}

        <button type="submit" className="submit-button">Enviar Checklist</button>
      </form>
    </div>
  );
}

export default ChecklistPage;