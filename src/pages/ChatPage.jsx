import React, { useState, useEffect, useRef, useCallback } from 'react'; // Adicionado useCallback
import '../styles/ChatPage.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import renameIcon from '../assets/rename.png';
import deleteIcon from '../assets/delete.png';
import menuIcon from '../assets/menu.png';

// Constantes para a animação de digitação
const INITIAL_TYPING_DELAY_MS = 2;
const ACCELERATED_TYPING_DELAY_MS = 2;
const ACCELERATION_THRESHOLD_CHARS = 80;

// URL base da API
const API_BASE_URL = 'https://es-chatbot-production.up.railway.app';
const SIDEBAR_ANIMATION_DELAY = 300;

function ChatPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chats, setChats] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedInitialChats, setHasLoadedInitialChats] = useState(false); // Novo estado

  const userName = "marsim";
  const chatMessagesEndRef = useRef(null);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats[activeChatId]?.messages]);

  useEffect(() => {
    document.body.className = isLightMode ? 'light-mode' : 'dark-mode';
  }, [isLightMode]);

  // useEffect para Carregamento Inicial de Chats
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/', { replace: true });
      return;
    }
    const savedChats = JSON.parse(localStorage.getItem('chats')) || {};
    setChats(savedChats); // Define os chats do localStorage

    const chatIds = Object.keys(savedChats);
    if (chatIds.length > 0) {
      const lastActiveChatId = localStorage.getItem('lastActiveChatId');
      if (lastActiveChatId && savedChats[lastActiveChatId]) {
        setActiveChatId(lastActiveChatId);
      } else {
        setActiveChatId(chatIds[0]);
      }
    } else {
      setActiveChatId(null); // Nenhum chat, nenhum ativo inicialmente
    }
    setHasLoadedInitialChats(true); // Sinaliza que o carregamento inicial e a configuração terminaram
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // Roda apenas uma vez na montagem (assumindo que navigate é estável)

  // useEffect para persistir 'chats' no localStorage
  useEffect(() => {
    // Só salva no localStorage se o carregamento inicial já ocorreu,
    // para evitar sobrescrever o localStorage com um estado vazio antes de carregar.
    if (hasLoadedInitialChats) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats, hasLoadedInitialChats]);

  // useEffect para persistir 'lastActiveChatId'
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('lastActiveChatId', activeChatId);
    }
    // Opcional: se não houver activeChatId após o carregamento inicial, limpar do localStorage
    // else if (hasLoadedInitialChats && Object.keys(chats).length === 0) {
    //   localStorage.removeItem('lastActiveChatId');
    // }
  }, [activeChatId, hasLoadedInitialChats]); // Adicionado hasLoadedInitialChats como dependencia

  const currentMessages = chats[activeChatId]?.messages || [];

  // handleNewChat memoizado
  const handleNewChat = useCallback(async (isInitial = false, suppressSidebarClose = false) => {
    if (!suppressSidebarClose && isSidebarVisible) {
        setIsSidebarVisible(false);
        await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }

    const newChatId = uuidv4(); // Gera ID fora para usar em setActiveChatId

    
    setChats(prevChats => {
        // Calcula nextNumber usando prevChats para não precisar de 'chats' como dependência do useCallback
        const existingNumbers = Object.values(prevChats)
            .map(chat => {
                const match = chat.title.match(/Chat (\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            })
            .filter(num => num > 0);
        const nextNumber = existingNumbers.length > 0 ? Math.max(0, ...existingNumbers) + 1 : 1;
        const newChatTitle = `Chat ${nextNumber}`;

        const newChatData = {
            id: newChatId,
            title: newChatTitle,
            messages: [], // Sempre começa com mensagens vazias para mostrar a saudação
            userHasTyped: false,
            // backendId: null // Se você estiver usando backendId, inicialize aqui
        };
        // Define o novo chat como ativo imediatamente APÓS esta atualização de estado
        // setActiveChatId é chamado fora deste callback do setChats
        return { ...prevChats, [newChatId]: newChatData };
    });
    setActiveChatId(newChatId); // Define o ID do novo chat como ativo
  }, [isSidebarVisible, setIsSidebarVisible, setChats, setActiveChatId]); // Dependências do useCallback

  // useEffect para criar um novo chat se a lista estiver vazia APÓS o carregamento inicial
  useEffect(() => {
    if (hasLoadedInitialChats && Object.keys(chats).length === 0) {
      // Verifica também se não há um activeChatId para evitar criar chat se um já está sendo criado
      if (!activeChatId) {
          console.log("useEffect: Nenhum chat. Criando novo chat inicial.");
          handleNewChat(true, true); // isInitial = true, suppressSidebarClose = true
      }
    }
  }, [chats, activeChatId, hasLoadedInitialChats, handleNewChat]);


  const handleSend = async () => {
    if (input.trim() === '' || !activeChatId) return;
    const userMessage = { sender: 'user', text: input, id: uuidv4() };
    const currentInputForAPI = input;
    setInput('');
    const botMessageId = uuidv4();
    let charactersTypedForCurrentBotResponse = 0;

    setChats(prevChats => {
      const currentActiveChat = prevChats[activeChatId];
      return {
        ...prevChats,
        [activeChatId]: {
          ...(currentActiveChat || { messages: [], title: 'Chat' }),
          messages: [
            ...(currentActiveChat?.messages || []),
            userMessage,
            { sender: 'bot', text: '', id: botMessageId }
          ],
          userHasTyped: true,
        }
      };
    });
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        navigate('/', { replace: true });
        setIsLoading(false); return;
      }
      const response = await fetch(`${API_BASE_URL}/llm/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: currentInputForAPI }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Erro ${response.status} do servidor.` }));
        console.error('Erro da API:', response.status, errorData);
        if (response.status === 401 || response.status === 403) {
          alert('Sua sessão expirou. Por favor, faça login novamente.');
          localStorage.removeItem('accessToken');
          navigate('/', { replace: true });
        }
        setChats(prevChats => {
          const activeChat = prevChats[activeChatId];
          if (!activeChat) return prevChats;
          const updatedMessages = activeChat.messages.map(msg =>
            msg.id === botMessageId ? { ...msg, text: `Erro: ${errorData.detail || response.statusText}` } : msg
          );
          return { ...prevChats, [activeChatId]: { ...activeChat, messages: updatedMessages }};
        });
        setIsLoading(false); return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamDone = false;
      let shouldCancelStreaming = false;
      const cancelStreaming = () => {
        shouldCancelStreaming = true;
        if (reader && typeof reader.cancel === 'function') {
          reader.cancel().catch(e => console.warn("Erro ao cancelar reader:", e));
        }
      };
      while (!streamDone && !shouldCancelStreaming) {
        const { value, done: readerDone } = await reader.read();
        streamDone = readerDone;
        if (shouldCancelStreaming) break;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          for (let i = 0; i < chunk.length; i++) {
            if (shouldCancelStreaming) break;
            const char = chunk[i];
            setChats(prevChats => {
              const activeChat = prevChats[activeChatId];
              if (!activeChat || !activeChat.messages.find(m => m.id === botMessageId)) {
                console.warn("Chat ou mensagem do bot não encontrada, interrompendo.");
                cancelStreaming(); return prevChats;
              }
              const updatedMessages = activeChat.messages.map(msg =>
                msg.id === botMessageId ? { ...msg, text: msg.text + char } : msg
              );
              return { ...prevChats, [activeChatId]: { ...activeChat, messages: updatedMessages }};
            });
            charactersTypedForCurrentBotResponse++;
            const currentDelay = charactersTypedForCurrentBotResponse > ACCELERATION_THRESHOLD_CHARS ?
                                 ACCELERATED_TYPING_DELAY_MS :
                                 INITIAL_TYPING_DELAY_MS;
            if (!shouldCancelStreaming) {
              await new Promise(resolve => setTimeout(resolve, currentDelay));
            }
          }
        }
      }
      if (shouldCancelStreaming) console.log("Streaming cancelado.");
    } catch (error) {
      console.error('Falha no fetch/stream:', error);
      setChats(prevChats => { /* ... tratamento de erro ... */ });
    } finally {
      setIsLoading(false);
    }
  };

  const processSendMessage = async () => {
    if (input.trim() === '' || !activeChatId) return;
    if (isSidebarVisible) {
      setIsSidebarVisible(false);
      await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }
    handleSend();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processSendMessage();
    }
  };

  const handleSelectChat = async (id) => {
    if (id === activeChatId) return;
    if (isSidebarVisible) {
      setIsSidebarVisible(false);
      await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }
    setActiveChatId(id);
  };


  const handleRenameChat = (id) => {

    const currentTitle = chats[id]?.title || '';

    const newTitle = prompt('Digite o novo nome do chat:', currentTitle);

    if (newTitle && newTitle.trim() !== '' && newTitle.trim() !== currentTitle) {

      const updatedChat = { ...chats[id], title: newTitle.trim() };

      setChats(prevChats => ({ ...prevChats, [id]: updatedChat }));

    }

  };

  // Esta função deve estar dentro do seu componente ChatPage

const handleDeleteChat = async (idToDelete) => {
    console.log("handleDeleteChat chamada com idToDelete:", idToDelete); // DEBUG
    
    const chatToDelete = chats[idToDelete]; // idToDelete é o UUID do frontend

    if (!chatToDelete) {
        console.error("Chat não encontrado para exclusão local:", idToDelete);
        return;
    }

    
    // Confirmação com o usuário
    const confirmed = window.confirm(`Tem certeza que deseja apagar o chat "${chatToDelete.title || 'sem título'}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) {
        return;
    }

    // Se a sidebar estiver aberta, feche-a ANTES de qualquer coisa e espere a animação
    if (isSidebarVisible) {
        setIsSidebarVisible(false);
        await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }

    const backendChatId = chatToDelete.backendId; // Pega o ID numérico do backend

    // Caso 1: Chat existe apenas localmente (não tem backendId)
    if (backendChatId === undefined || backendChatId === null) {
        console.warn("Este chat não parece estar salvo no servidor (sem backendId). Removendo apenas localmente.");
        setChats(prevChats => {
            const updatedChats = { ...prevChats };
            delete updatedChats[idToDelete];

            const remainingKeys = Object.keys(updatedChats);
            let newActiveId = activeChatId;

            if (activeChatId === idToDelete) { // Se o chat ativo foi deletado
                newActiveId = remainingKeys.length > 0 ? remainingKeys[0] : null;
            } else if (remainingKeys.length === 0) { // Se a lista ficou vazia (e o ativo não era este)
                newActiveId = null;
            } else if (!updatedChats[activeChatId] && remainingKeys.length > 0 ) { // Se o ID ativo se tornou inválido e há outros chats
                newActiveId = remainingKeys[0];
            }
            // Se activeChatId não era idToDelete e ainda é válido, ele permanece.

            setActiveChatId(newActiveId);
            // O useEffect que observa 'chats' e 'hasLoadedInitialChats' cuidará de
            // criar um novo chat automaticamente se newActiveId for null e remainingKeys.length for 0.
            return updatedChats;
        });
        return;
    }

    // Caso 2: Chat tem backendId, prossegue com a deleção no servidor
    setIsLoading(true);
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            navigate('/', { replace: true });
            setIsLoading(false);
            return;
        }

        const response = await fetch(`${API_BASE_URL}/chat-history/${backendChatId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (response.ok) { // Geralmente 204 No Content para DELETE bem-sucedido
            console.log(`Chat com backendId ${backendChatId} (frontendId: ${idToDelete}) deletado com sucesso no servidor.`);
            // Atualiza o estado local APÓS o sucesso no backend
            setChats(prevChats => {
                const updatedChats = { ...prevChats };
                delete updatedChats[idToDelete]; // Usa o idToDelete (UUID do frontend)

                const remainingKeys = Object.keys(updatedChats);
                let newActiveId = activeChatId;

                if (activeChatId === idToDelete) {
                    newActiveId = remainingKeys.length > 0 ? remainingKeys[0] : null;
                } else if (remainingKeys.length === 0) {
                    newActiveId = null;
                } else if (!updatedChats[activeChatId] && remainingKeys.length > 0 ) {
                     newActiveId = remainingKeys[0];
                }

                setActiveChatId(newActiveId);
                // O useEffect que observa 'chats' e 'hasLoadedInitialChats' cuidará de criar um novo chat.
                return updatedChats;
            });

        } else {
            // Trata erros do backend (401, 403, 404, 422, 500 etc.)
            let errorDetail = `Erro ${response.status}: ${response.statusText}`;
            try {
                // Tenta parsear como JSON se houver corpo (ex: erro de validação 422)
                const errorJson = await response.json();
                errorDetail = errorJson.detail || JSON.stringify(errorJson);
            } catch (e) {
                // Se não for JSON, tenta ler como texto
                const textError = await response.text().catch(() => '');
                if (textError) errorDetail = textError;
            }
            console.error('Erro ao deletar chat no backend:', response.status, errorDetail);
            alert(`Falha ao deletar o chat no servidor: ${errorDetail}`);

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                navigate('/', { replace: true });
            }
        }
    } catch (error) {
        console.error('Erro na requisição para deletar chat:', error);
        alert(`Erro de conexão ao tentar deletar o chat: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
};

  const handleLogout = () => {

    localStorage.removeItem('accessToken');

    localStorage.removeItem('chats');

    localStorage.removeItem('lastActiveChatId');

    alert('Você foi deslogado!');

    navigate('/', { replace: true });

  };

  const shouldShowGreeting = activeChatId &&
                              chats[activeChatId] &&
                              chats[activeChatId].messages.length === 0 &&
                              !chats[activeChatId].userHasTyped;

  return (
    <div className={`app-container ${isLightMode ? 'light-mode' : 'dark-mode'}`}>
      <div className={`sidebar ${isSidebarVisible ? '' : 'collapsed'}`}>
        <div className="sidebar-header"><span>ChatEdu POLI</span></div>
        <button className="new-chat-button" onClick={() => handleNewChat(false, false)}>+ Novo Chat</button>
        <div className="chat-history-list">
          {Object.entries(chats)
            .sort(([, chatA], [, chatB]) => (chatB.messages[chatB.messages.length -1]?.timestamp || Date.parse(chatB.createdAt) || 0) - (chatA.messages[chatA.messages.length -1]?.timestamp || Date.parse(chatA.createdAt) || 0)) // Exemplo de sort
            .map(([id, chat]) => (
            <div key={id} className={`chat-entry ${id === activeChatId ? 'active' : ''}`}>
              <div className="chat-history-button" onClick={() => handleSelectChat(id)} title={chat.title}>{chat.title}</div>
              {id === activeChatId && (
                <div className="chat-icons">
                  <img src={renameIcon} alt="Renomear" title="Renomear" className="chat-icon" onClick={(e) => { e.stopPropagation(); handleRenameChat(id);}} />
                  <img src={deleteIcon} alt="Excluir" title="Excluir" className="chat-icon" onClick={(e) => { e.stopPropagation(); handleDeleteChat(id);}} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="sidebar-footer"></div>
      </div>

      <div className="main-panel">
        <div className="main-panel-header">
          <div className="main-panel-header-left">
            <button className="menu-toggle-main" onClick={() => setIsSidebarVisible(prev => !prev)}><img src={menuIcon} alt="Menu" className="menu-icon-main" /></button>
            <span className="main-panel-title">
                {activeChatId && chats[activeChatId] ? chats[activeChatId].title : (Object.keys(chats).length > 0 ? "Selecione um chat" : "Chat")}
            </span>
          </div>
          <div className="main-panel-header-right">
            <button className="theme-toggle-header" onClick={() => setIsLightMode(prev => !prev)}>{isLightMode ? '🌙' : '☀️'}</button>
            <div className="user-menu-wrapper-header">
              <button className="user-icon-header" onClick={() => setShowUserMenu(prev => !prev)}>👤</button>
              {showUserMenu && (
                <div className="user-menu-header">
                  <p><strong>Usuário:</strong> {userName}</p>
                  <button className="logout-button-header" onClick={handleLogout}>Sair</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="chat-content">
          {/* Lógica de renderização do conteúdo do chat com keys para animação */}
          {activeChatId && chats[activeChatId] ? (
            shouldShowGreeting ? (
                <div className="greeting-message-container" key={`greeting-${activeChatId}`}>
                    <h1 className="greeting-message">Olá, {userName}</h1>
                    <p className="greeting-submessage">Como posso te ajudar hoje?</p>
                </div>
            ) : (
                <div className="chat-messages" key={activeChatId}>
                    {currentMessages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                            {msg.text.split('\n').map((line, i) => (<span key={i}>{line}<br/></span>))}
                        </div>
                    ))}
                    {isLoading && (<div className="message bot"><span>Digitando...</span></div>)}
                    <div ref={chatMessagesEndRef} />
                </div>
            )
          ) : (
            <div className="greeting-message-container" key="initial-empty-greeting">
                 <h1 className="greeting-message">Bem-vindo ao ChatEdu!</h1>
                 <p className="greeting-submessage">Crie um novo chat ou selecione um para começar.</p>
            </div>
          )}
        </div>

        <div className="input-area-wrapper">
          <div className="chat-input-container">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Digite sua mensagem..." className="chat-input" rows="1" disabled={!activeChatId || isLoading} />
            <button onClick={processSendMessage} className="send-button" disabled={!activeChatId || !input.trim() || isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChatPage;