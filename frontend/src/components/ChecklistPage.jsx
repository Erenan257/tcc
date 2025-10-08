import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChecklistPage.css';

function ChecklistPage() {
  const [insumos, setInsumos] = useState([]);
  const [itemStatuses, setItemStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/insumos');
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
  }, []);

  const handleStatusChange = (insumoId, status) => {
    setItemStatuses(prevStatuses => ({
      ...prevStatuses,
      [insumoId]: status
    }));
  };
  
  // AQUI ESTÁ A CORREÇÃO PRINCIPAL
  // Toda a lógica de envio foi movida para DENTRO da função handleSubmit
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 1. Formatar os dados para o formato que a API espera
    const itensArray = Object.keys(itemStatuses).map(insumoId => ({
      id_insumo: parseInt(insumoId),
      status: itemStatuses[insumoId]
    }));

    // 2. Monta o corpo (payload) completo da requisição
    const checklistPayload = {
      // ATENÇÃO: Por enquanto, estamos usando valores fixos.
      id_ambulancia: 1, 
      id_socorrista: 1, 
      turno: "Manhã",
      itens: itensArray
    };

    // 3. Envia os dados para a API
    try {
      const response = await fetch('http://localhost:5000/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checklistPayload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Checklist enviado com sucesso!');
        navigate('/dashboard'); 
      } else {
        alert(`Erro ao enviar checklist: ${data.message}`);
      }
    } catch (error) {
      alert('Erro de conexão ao enviar o checklist. Verifique se o back-end está no ar.');
      console.error(error);
    }
  }; // A função handleSubmit termina aqui.

  // A lógica de loading e error fica aqui, antes do return principal
  if (loading) {
    return <p className="loading-message">Carregando lista de insumos...</p>;
  }
  if (error) {
    return <p className="error-message">Erro ao carregar insumos: {error}</p>;
  }
  
  // O return com o JSX fica por último
  return (
    <div className="checklist-container">
      <form className="checklist-form" onSubmit={handleSubmit}>
        <h1>Checklist de Insumos da Viatura</h1>
        <div className="checklist-header">
          <span>Insumo</span>
          <span>Status</span>
        </div>

        {insumos.map((insumo) => (
          <div className="checklist-item" key={insumo.ID_Insumo}>
            <span className="item-name">{insumo.Nome_Insumo}</span>
            <div className="item-actions">
              <button
                type="button"
                className={`status-button ${itemStatuses[insumo.ID_Insumo] === 'Presente' ? 'selected-presente' : ''}`}
                onClick={() => handleStatusChange(insumo.ID_Insumo, 'Presente')}
              >
                Presente
              </button>
              <button
                type="button"
                className={`status-button ${itemStatuses[insumo.ID_Insumo] === 'Ausente' ? 'selected-ausente' : ''}`}
                onClick={() => handleStatusChange(insumo.ID_Insumo, 'Ausente')}
              >
                Ausente
              </button>
            </div>
          </div>
        ))}

        <button type="submit" className="submit-button">Enviar Checklist</button>
      </form>
    </div>
  );
}

export default ChecklistPage;