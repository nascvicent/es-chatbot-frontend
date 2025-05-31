import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // ATUALIZADO: pega o valor do parâmetro 'user' (enviado pelo backend)
    const base64Payload = searchParams.get('user');

    if (base64Payload) {
      try {
        // 1. Decodifica de Base64 para string
        const jsonString = atob(base64Payload);
        // 2. Converte a string JSON para objeto JavaScript
        const tokenData = JSON.parse(jsonString);

        console.log("Dados decodificados:", tokenData);

        const accessToken = tokenData.access_token;
        const refreshToken = tokenData.refresh_token;

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          console.log("Tokens salvos no localStorage a partir do Base64");
          navigate('/chat'); // redireciona após login bem-sucedido
        } else {
          console.error("Access token não encontrado no payload decodificado.");
          navigate('/login');
        }
      } catch (error) {
        console.error("Erro ao decodificar ou processar o payload Base64:", error);
        navigate('/login');
      }
    } else {
      console.error("Nenhum payload Base64 encontrado na URL (parâmetro 'user' ausente).");
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <div>Processando autenticação com o Google...</div>;
}

export default GoogleAuthCallback;
