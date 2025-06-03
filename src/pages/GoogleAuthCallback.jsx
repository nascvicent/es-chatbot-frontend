import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const base64Payload = searchParams.get('user');

    if (base64Payload) {
      try {
        const jsonString = atob(base64Payload);
        const tokenData = JSON.parse(jsonString);

        console.log("Dados decodificados do backend:", tokenData); // Ótimo para depurar

        // ATUALIZAÇÃO CRÍTICA AQUI: Use o id_token como o accessToken para sua API
        const apiAccessToken = tokenData.id_token; // <<< MUDANÇA AQUI
        const googleRefreshToken = tokenData.refresh_token; // Este é o refresh token do Google

        if (apiAccessToken) {
          localStorage.setItem('accessToken', apiAccessToken); // Salva o id_token como 'accessToken'
          if (googleRefreshToken) {
            // Você pode querer salvar o refresh_token do Google também,
            // mas sua utilidade dependerá de como o backend lida com a renovação de sessão.
            // Por agora, vamos focar no id_token.
            localStorage.setItem('googleRefreshToken', googleRefreshToken); // Nomeie claramente se for salvá-lo
            console.log("id_token (como accessToken) e googleRefreshToken salvos.");
          } else {
            console.log("id_token (como accessToken) salvo. Nenhum googleRefreshToken encontrado.");
          }
          navigate('/chat');
        } else {
          console.error("id_token não encontrado no payload decodificado do backend.");
          navigate('/login'); // ou para uma página de erro
        }
      } catch (error) {
        console.error("Erro ao decodificar ou processar o payload Base64 do backend:", error);
        navigate('/login'); // ou para uma página de erro
      }
    } else {
      console.error("Nenhum payload Base64 encontrado na URL (parâmetro 'user' ausente).");
      navigate('/login'); // ou para uma página de erro
    }
  }, [searchParams, navigate]);

  return <div>Processando autenticação com o Google...</div>;
}

export default GoogleAuthCallback;