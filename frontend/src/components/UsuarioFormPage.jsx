import React, { useState, useEffect } from 'react';
// 1. Importamos useParams para ler o ID da URL
import { useNavigate, useParams } from 'react-router-dom';
import './LoginPage.css';

function UsuarioFormPage() {
  const navigate = useNavigate();
  // 2. Usamos useParams para pegar o id_usuario da URL.
  // Ex: na URL '/admin/usuarios/2', id_usuario será '2'.
  // Na URL '/admin/usuarios/novo', id_usuario será 'undefined'.
  const { id_usuario } = useParams();

  // 3. Verificamos se estamos em modo de edição
  const isEditMode = Boolean(id_usuario);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); // Senha só é obrigatória na criação
  const [perfil, setPerfil] = useState('Socorrista');
  const [message, setMessage] = useState('');

  // 4. useEffect para buscar dados do usuário SE estivermos em modo de edição
  useEffect(() => {
    if (isEditMode) {
      const fetchUsuario = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/usuarios/${id_usuario}`);
          const data = await response.json();
          if (response.ok) {
            // 5. Preenchemos os estados com os dados do usuário buscado
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
  }, [id_usuario, isEditMode]); // Roda o efeito quando o componente monta ou se o ID mudar

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // 6. A lógica de submissão agora diferencia entre Editar (PUT) e Criar (POST)
    const url = isEditMode 
      ? `http://localhost:5000/api/usuarios/${id_usuario}` 
      : 'http://localhost:5000/api/usuarios';
      
    const method = isEditMode ? 'PUT' : 'POST';

    // No modo de edição, não enviamos a senha se ela não for alterada
    const payload = { nome, email, perfil };
    if (!isEditMode || (isEditMode && senha)) {
      payload.senha = senha;
    }

    try {
      const response = await fetch(url, {
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

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {/* 7. Título dinâmico */}
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