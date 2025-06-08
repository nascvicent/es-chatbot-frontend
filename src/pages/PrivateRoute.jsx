// src/pages/PrivateRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importe a função

// Adicionamos a prop 'roleRequerida' para podermos reutilizar este componente
function PrivateRoute({ children, roleRequerida }) {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');

  // 1. Se não houver token, redireciona para o login
  if (!token) {
    console.log("PrivateRoute: Token não encontrado. Redirecionando para /");
    return <Navigate to="/" replace />;
  }

  try {
    // 2. Decodifica o token para acessar suas informações (como a data de expiração)
    const decodedToken = jwtDecode(token);
    const agora = Date.now() / 1000; // Data atual em segundos

    // 3. Verifica se o token expirou
    if (decodedToken.exp < agora) {
      console.log("PrivateRoute: Token expirado. Redirecionando para /");
      // Opcional: Limpar o localStorage para não deixar lixo
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      return <Navigate to="/" replace />;
    }

    // 4. (Bônus) Verifica se o usuário tem a permissão necessária para esta rota
    if (roleRequerida && userRole !== roleRequerida) {
      console.log(`PrivateRoute: Acesso negado. Requer: ${roleRequerida}, Usuário tem: ${userRole}`);
      // Redireciona para uma página segura (como o chat) ou de "acesso negado"
      return <Navigate to="/chat" replace />; 
    }

  } catch (error) {
    // 5. Se o token for inválido/malformado, a decodificação falhará
    console.error("PrivateRoute: Token inválido.", error);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    return <Navigate to="/" replace />;
  }
  
  // Se tudo estiver OK, renderiza a página protegida
  return children;
}

export default PrivateRoute;