// src/pages/GoogleAuthCallback.jsx

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // salva os tokens no local do server
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      
      navigate('/chat');
    } else {
     // caso de algo erradso
      console.error("Tokens de autenticação não encontrados na URL.");
      navigate('/login');
    }
  }, [searchParams, navigate]);

  // dps fzr animacao de autenticacao aq
  return <div>Processando autenticação...</div>;
}

export default GoogleAuthCallback;