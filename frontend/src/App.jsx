import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/DashboardPage';
import ChecklistPage from './components/ChecklistPage';
import PedidosPage from './components/PedidosPage';
import AdminUsuariosPage from './components/AdminUsuariosPage';
import PedidoDetailPage from './components/PedidoDetailPage';
import UsuarioFormPage from './components/UsuarioFormPage';
import AdminInsumosPage from './components/AdminInsumosPage';
import InsumoFormPage from './components/InsumoFormPage';
import InventarioPage from './components/InventarioPage';
import './App.css';

function AppRoutes() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const navigate = useNavigate();

  const handleLoginSuccess = (dadosUsuario) => {
    setUsuarioLogado(dadosUsuario);

    // Esta lógica continua correta para o momento do login
    if (dadosUsuario.Perfil === 'Socorrista') { // 
      navigate('/dashboard');
    } else if (dadosUsuario.Perfil === 'Farmacia' || dadosUsuario.Perfil === 'Gestor') { // 
      navigate('/admin/pedidos');
    } else {
      navigate('/');
    }
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          // Se NÃO houver usuário logado, mostre a LoginPage
          !usuarioLogado ? (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            // AQUI ESTÁ A CORREÇÃO:
            // Se HOUVER um usuário logado, verifique o perfil dele para decidir para onde redirecionar
            usuarioLogado.Perfil === 'Socorrista' ? <Navigate to="/dashboard" /> : <Navigate to="/admin/pedidos" />
          )
        } 
      />
      
      {/* O resto das rotas continua igual */}
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
      <Route 
        path="/admin/usuarios/novo" 
        element={usuarioLogado ? <UsuarioFormPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/usuarios/:id_usuario" 
        element={usuarioLogado ? <UsuarioFormPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/insumos" 
        element={usuarioLogado ? <AdminInsumosPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/insumos/novo" 
        element={usuarioLogado ? <InsumoFormPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/admin/insumos/:id_insumo" 
        element={usuarioLogado ? <InsumoFormPage /> : <Navigate to="/" />} 
      />
      <Route 
        path="/inventario" 
        element={usuarioLogado ? <InventarioPage /> : <Navigate to="/" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;