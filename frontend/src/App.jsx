import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ChecklistPage from './components/ChecklistPage';
import PedidosPage from './components/PedidosPage';
import './App.css';

function App() {
  // 1. Criamos um estado para guardar os dados do usuário logado.
  // O valor inicial é 'null', significando que ninguém está logado.
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // 2. Função que será chamada pelo LoginPage em um login bem-sucedido.
  const handleLoginSuccess = (dadosUsuario) => {
    setUsuarioLogado(dadosUsuario); // Guarda os dados do usuário no estado.
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            // 3. Lógica de Roteamento:
            // Se NÃO houver um usuário logado, mostre a LoginPage.
            !usuarioLogado ? (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            ) : (
              // Se HOUVER um usuário logado, redirecione para o /dashboard.
              <Navigate to="/dashboard" />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            // 4. Lógica de Proteção de Rota:
            // Se HOUVER um usuário logado, mostre o Dashboard.
            usuarioLogado ? (
              <DashboardPage usuario={usuarioLogado} />
            ) : (
              // Se NÃO HOUVER, redirecione de volta para a página de login.
              <Navigate to="/" />
            )
          } 
        />
        <Route 
          path="/checklist" 
          element={
            usuarioLogado ?
               <ChecklistPage /> : <Navigate to="/" />} />
        <Route 
          path="/pedidos"  
          element={
            usuarioLogado ? <PedidosPage /> : <Navigate to="/" />
            } 
          />
        </Routes>
    </BrowserRouter>
  );
}

export default App;