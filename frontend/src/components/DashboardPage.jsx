// 1. VERIFIQUE ESTA LINHA DE IMPORTAÇÃO
import React from 'react';
import { useNavigate } from 'react-router-dom'; // <--- ESTA LINHA É ESSENCIAL
import './DashboardPage.css';

function DashboardPage({ usuario }) {
  // 2. VERIFIQUE ESTA LINHA DE INICIALIZAÇÃO
  const navigate = useNavigate(); // <--- E ESTA LINHA TAMBÉM É ESSENCIAL

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>E-MedLog</h1>
        <p>Bem-vindo, {usuario.Nome}!</p>
      </header>
      <main className="dashboard-main">
        {/* O onClick aqui usa a função 'navigate' que criamos acima */}
        <button className="dashboard-button" onClick={() => navigate('/checklist')}>
          Realizar Checklist
        </button>
        <button className="dashboard-button" onClick={() => navigate('/pedidos')}>
          Visualizar Status dos Pedidos
        </button>
        <button className="dashboard-button" onClick={() => navigate('/inventario')}>
          Visualizar Inventário
        </button>
      </main>
    </div>
  );
}

export default DashboardPage;