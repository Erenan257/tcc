import React, { useState } from 'react';
// 1. Importamos useNavigate aqui
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ChecklistPage from './components/ChecklistPage';
import PedidosPage from './components/PedidosPage';
import AdminUsuariosPage from './components/AdminUsuariosPage';
import PedidoDetailPage from './components/PedidoDetailPage';
import './App.css';

// Criamos um componente interno para poder usar o hook useNavigate
function AppRoutes() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate(); // O hook de navegação agora vive aqui

  // Esta função agora contém a lógica de redirecionamento
  const handleLoginSuccess = (dadosUsuario) => {
    setUsuarioLogado(dadosUsuario); // Guarda os dados do usuário no estado

    // 2. LÓGICA DE REDIRECIONAMENTO BASEADA NO PERFIL
    if (dadosUsuario.Perfil === 'Socorrista') {
      navigate('/dashboard');
    } else if (dadosUsuario.Perfil === 'Farmacia' || dadosUsuario.Perfil === 'Gestor') {
      // A página inicial para perfis administrativos será a de pedidos
      navigate('/admin/pedidos');
    } else {
      // Se por algum motivo não tiver perfil, volta para o login
      navigate('/');
    }
  };

  // As rotas que já criamos
  return (
    <Routes>
      <Route 
        path="/" 
        element={!usuarioLogado ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/dashboard" 
        element={usuarioLogado ? <DashboardPage usuario={usuarioLogado} /> : <Navigate to="/" />} 
      />
      <Route 
        path="/checklist" 
        element={usuarioLogado ? <ChecklistPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/pedidos" 
        element={usuarioLogado ? <PedidosPage /> : <Navigate to="/" />} 
      />
       <Route 
        path="/pedidos/:id_pedido" 
        element={usuarioLogado ? <PedidoDetailPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/pedidos" 
        element={usuarioLogado ? <PedidosPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/usuarios" 
        element={usuarioLogado ? <AdminUsuariosPage /> : <Navigate to="/" />} 
      />
    </Routes>
  );
}

// O componente App principal apenas prepara o BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;