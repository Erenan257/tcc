import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './LoginPage.css';

function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id_usuario } = useParams();
  const isEditMode = Boolean(id_usuario);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('Socorrista');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchUsuario = async () => {
        try {
          // --- ALTERAÇÃO 1 AQUI ---
          // ANTES: const response = await fetch(`http://localhost:5000/api/usuarios/${id_usuario}`);
          // DEPOIS:
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/${id_usuario}`);

          const data = await response.json();
          if (response.ok) {
            setNome(data.Nome);
            setEmail(data.Email);
            setPerfil(data.Perfil);
          } else {
            throw new Error(data.message);
          }
        } catch (err) {
          setMessage(`Erro ao carregar dados do usuário: ${err.message}`);
        }
      };
      fetchUsuario();
    }
  }, [id_usuario, isEditMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // --- ALTERAÇÃO 2 AQUI (na variável 'url' e no 'fetch' final) ---
    // A variável 'url' agora guarda apenas o caminho, não a URL completa
    const urlPath = isEditMode 
      ? `/api/usuarios/${id_usuario}` 
      : '/api/usuarios';
      
    const method = isEditMode ? 'PUT' : 'POST';

    const payload = { nome, email, perfil };
    if (!isEditMode || (isEditMode && senha)) {
      payload.senha = senha;
    }

    try {
      // A URL completa é montada aqui, usando a variável de ambiente
      const response = await fetch(`${import.meta.env.VITE_API_URL}${urlPath}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok) {
        alert(`Usuário ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
        navigate('/admin/usuarios');
      } else {
        setMessage(data.message || 'Ocorreu um erro.');
      }
    } catch (error) {
      setMessage('Erro de conexão com o servidor.');
    }
  };

  // O JSX do return continua o mesmo
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{isEditMode ? 'Editar Usuário' : 'Criar Novo Usuário'}</h2>
        {message && <p className="feedback-message">{message}</p>}

        <div className="input-group">
          <label htmlFor="nome">Nome Completo</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="senha">{isEditMode ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha Provisória'}</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required={!isEditMode} />
        </div>
        <div className="input-group">
          <label htmlFor="perfil">Perfil</label>
          <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            <option value="Socorrista">Socorrista</option>
            <option value="Farmacia">Farmácia</option>
            <option value="Gestor">Gestor</option>
          </select>
        </div>
        <button type="submit">Salvar Usuário</button>
      </form>
    </div>
  );
}

export default UsuarioFormPage;