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

        console.log("Dados completos recebidos do backend:", tokenData);

        const tokenParaAutenticacao = tokenData.id_token;
        const refreshToken = tokenData.refresh_token;

        if (tokenParaAutenticacao) {
          localStorage.setItem('accessToken', tokenParaAutenticacao);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          console.log("ID Token (usado para autenticação) salvo no localStorage.");

          const fetchUserData = async () => {
            try {
              const backendBaseUrl = 'https://es-chatbot-production.up.railway.app';
              const response = await fetch(`${backendBaseUrl}/users/me`, {
                headers: {
                  'Authorization': `Bearer ${tokenParaAutenticacao}`,
                }
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({detail: "Erro desconhecido"}));
                throw new Error(errorData.detail || 'Falha ao buscar dados do usuário.');
              }

              const userData = await response.json();
              console.log("Dados do usuário de /users/me:", userData);

              // Extrai e salva os dados do usuário com segurança
              const userFullName = userData.name || 'Usuário';
              const userAvatarUrl = userData.avatar_url;
              const userRole = userData.role || 'user'; // Define um role padrão se não vier

              localStorage.setItem('userFirstName', userFullName.split(' ')[0]);
              // Salva a URL do avatar apenas se ela existir
              if (userAvatarUrl) {
                localStorage.setItem('userAvatarUrl', userAvatarUrl);
              } else {
                localStorage.removeItem('userAvatarUrl'); // Remove qualquer avatar antigo se não vier um novo
              }
              localStorage.setItem('userRole', userRole);

              // Redireciona com base no role
              if (userRole === 'admin') {
                navigate('/dashboard');
              } else {
                navigate('/chat');
              }

            } catch (error) {
              console.error("Erro ao buscar/processar dados do usuário:", error);
              // Mesmo com erro, se temos o token, podemos ir para o chat com dados padrão
              localStorage.setItem('userFirstName', 'Usuário');
              localStorage.removeItem('userAvatarUrl');
              navigate('/chat');
            }
          };

          fetchUserData();

        } else {
          throw new Error("ID Token não encontrado no payload.");
        }
      } catch (error) {
        console.error("Erro no callback do Google:", error);
        navigate('/'); // Redireciona para home/login em caso de erro crítico
      }
    } else {
      console.error("Nenhum payload 'user' encontrado na URL.");
      navigate('/');
    }
  }, [searchParams, navigate]);

  return <div>Processando autenticação...</div>;
}

export default GoogleAuthCallback;
