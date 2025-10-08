import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar o useNavigate
import './LoginPage.css';

// 2. Agora o componente recebe a propriedade 'onLoginSuccess'
function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // 3. Inicializar o hook de navegação

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, senha: password }),
      });

      const data = await response.json();

      if (data.status === 'sucesso') {
        // 4. Se o login deu certo:
        onLoginSuccess(data.usuario); // Avisa o App.jsx, passando os dados do usuário
        navigate('/dashboard'); // Navega para o dashboard
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Não foi possível conectar ao servidor.');
      console.error('Erro de conexão:', error);
    }
  };

  // O JSX (return) continua exatamente o mesmo de antes
  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>E-MedLog</h2>
        {message && <p className="feedback-message">{message}</p>}
        {/* ... resto do formulário ... */}
        <div className="input-group">
          <label htmlFor="email">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Entrar</button>
        <a href="#" className="forgot-password">Esqueci minha senha</a>
      </form>
    </div>
  );
}

export default LoginPage;