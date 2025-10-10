import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './LoginPage.css'; // Reutilizando o estilo do formulário

function InsumoFormPage() {
  const navigate = useNavigate();
  const { id_insumo } = useParams();
  const isEditMode = Boolean(id_insumo);

  const [formData, setFormData] = useState({
    nome_insumo: '',
    unidade_medida: '',
    quantidade_minima: '',
    descricao: '',
    critico: false,
    categoria: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchInsumo = async () => {
        try {
          // --- ALTERAÇÃO 1 AQUI ---
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/insumos/${id_insumo}`);
          const data = await response.json();
          if (response.ok) {
            setFormData({
              nome_insumo: data.Nome_Insumo,
              unidade_medida: data.Unidade_Medida,
              quantidade_minima: data.Quantidade_Minima,
              descricao: data.Descricao || '',
              critico: data.Critico,
              categoria: data.Categoria || ''
            });
          } else {
            throw new Error(data.message);
          }
        } catch (err) {
          setMessage(`Erro ao carregar dados do insumo: ${err.message}`);
        }
      };
      fetchInsumo();
    }
  }, [id_insumo, isEditMode]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // --- ALTERAÇÃO 2 AQUI ---
    // A variável 'urlPath' agora guarda apenas o caminho
    const urlPath = isEditMode 
      ? `/api/insumos/${id_insumo}` 
      : '/api/insumos';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      // A URL completa é montada aqui, usando a variável de ambiente
      const response = await fetch(`${import.meta.env.VITE_API_URL}${urlPath}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantidade_minima: parseInt(formData.quantidade_minima, 10),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Insumo ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
        navigate('/admin/insumos');
      } else {
        setMessage(data.message || 'Ocorreu um erro.');
      }
    } catch (error) {
      setMessage('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{isEditMode ? 'Editar Insumo' : 'Criar Novo Insumo'}</h2>
        {message && <p className="feedback-message">{message}</p>}

        <div className="input-group">
          <label>Nome do Insumo</label>
          <input type="text" name="nome_insumo" value={formData.nome_insumo} onChange={handleInputChange} required />
        </div>
        <div className="input-group">
          <label>Unidade de Medida</label>
          <input type="text" name="unidade_medida" value={formData.unidade_medida} onChange={handleInputChange} required />
        </div>
        <div className="input-group">
          <label>Quantidade Mínima</label>
          <input type="number" name="quantidade_minima" value={formData.quantidade_minima} onChange={handleInputChange} required />
        </div>
        <div className="input-group">
          <label>Descrição (Opcional)</label>
          <input type="text" name="descricao" value={formData.descricao} onChange={handleInputChange} />
        </div>
        <div className="input-group">
          <label>Categoria (Opcional)</label>
          <input type="text" name="categoria" value={formData.categoria} onChange={handleInputChange} />
        </div>
        <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
          <label>Item Crítico?</label>
          <input type="checkbox" name="critico" checked={formData.critico} onChange={handleInputChange} />
        </div>
        
        <button type="submit">Salvar Insumo</button>
      </form>
    </div>
  );
}

export default InsumoFormPage;