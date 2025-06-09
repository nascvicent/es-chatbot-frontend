import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // pega o payload codificado da URL
    const base64Payload = searchParams.get('user');

    if (base64Payload) {
      try {
        // 2. Decodifica e parseia o JSON
        const jsonString = atob(base64Payload);
        const tokenData = JSON.parse(jsonString);

        console.log("Dados completos recebidos do backend:", tokenData);

        
        // 3. pega o 'id_token' em vez do 'access_token'
        const tokenParaAutenticacao = tokenData.id_token; 
        const refreshToken = tokenData.refresh_token;

        if (tokenParaAutenticacao) {
          // 4. Salva o 'id_token' no localStorage. 
          // continuar usando a chave 'accessToken' por consistência com o resto do app.
          localStorage.setItem('accessToken', tokenParaAutenticacao);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          console.log("ID Token (usado para autenticação) salvo no localStorage.");

          // 5. Busca os dados do usuário usando o 'id_token' para autenticar
          const fetchUserRole = async () => {
            try {
              const backendBaseUrl = `${import.meta.env.VITE_API_URL}`;
              const response = await fetch(`${backendBaseUrl}/users/me`, {
                headers: {
                  // O cabeçalho agora envia o 'id_token' correto
                  'Authorization': `Bearer ${tokenParaAutenticacao}`, 
                  'Content-Type': 'application/json'
                }
              });

              if (!response.ok) {
                // Se a resposta não for OK, tenta pegar o detalhe do erro do backend
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha ao buscar dados do usuário.');
              }

              const userData = await response.json();
              console.log("Dados do usuário de /users/me (sucesso!):", userData);

              // Extrai o role e redireciona o usuário
              const userRole = userData.role;
              localStorage.setItem('userRole', userRole);

              localStorage.setItem('userFirstName', userData.name); 

// Salva a URL do avatar, usando a chave 'avatar_url' que vem do backend.
              localStorage.setItem('userAvatarUrl', userData.avatar_url);

              if (userRole === 'admin') {
                navigate('/dashboard');
              } else if (userRole === 'user') {
                navigate('/chat');
              } else {
                console.warn("Role do usuário desconhecido:", userRole);
                navigate('/');
              }

            } catch (error) {
              console.error("Erro ao buscar role do usuário:", error);
              navigate('/');
            }
          };

          fetchUserRole();

        } else {
          console.error("ID Token não encontrado no payload decodificado.");
          navigate('/');
        }
      } catch (error) {
        console.error("Erro ao decodificar ou processar o payload Base64:", error);
        navigate('/');
      }
    } else {
      console.error("Nenhum payload 'user' encontrado na URL.");
      navigate('/');
    }
  }, [searchParams, navigate]);

  return <div>Processando autenticação com o Google...</div>;
}

export default GoogleAuthCallback;