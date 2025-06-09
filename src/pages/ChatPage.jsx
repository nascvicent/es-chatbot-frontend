import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ChatPage.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import renameIcon from '../assets/rename.png';
import deleteIcon from '../assets/delete.png';
import menuIcon from '../assets/menu.png';

// --- Constantes ---
const INITIAL_TYPING_DELAY_MS = 5;
const ACCELERATED_TYPING_DELAY_MS = 5;
const ACCELERATION_THRESHOLD_CHARS = 80;
const API_BASE_URL = 'https://es-chatbot-production.up.railway.app';
const SIDEBAR_ANIMATION_DELAY = 300;

// --- Funções Auxiliares Estáveis ---
const mapBackendMessagesToFrontend = (backendMessages = []) => {
  return backendMessages.map(msg => ({
    id: uuidv4(),
    text: msg.content,
    sender: msg.role === 'user' ? 'user' : 'bot',
  }));
};

function ChatPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chats, setChats] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingChatAction, setIsProcessingChatAction] = useState(false);
  const [hasLoadedInitialChats, setHasLoadedInitialChats] = useState(false);

  
  const chatMessagesEndRef = useRef(null);
  const [userName, setUserName] = useState("Usuário");
  const [userAvatar, setUserAvatar] = useState(null);
  // --- Efeitos ---
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [chats[activeChatId]?.messages]);
  useEffect(() => { document.body.className = isLightMode ? 'light-mode' : 'dark-mode'; }, [isLightMode]);

  // handleNewChat agora apenas cria o chat LOCALMENTE. A persistência acontece no primeiro handleSend.
  const handleNewChat = useCallback(async (isInitial = false, suppressSidebarClose = false) => {
    if (isProcessingChatAction) return;

    if (!suppressSidebarClose && isSidebarVisible) {
      setIsSidebarVisible(false);
      await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }

    const newChatFrontendId = `local_${uuidv4()}`; // ID temporário para chats não salvos
    setChats(prevChats => {
      const existingNumbers = Object.values(prevChats).map(chat => { const match = chat.title.match(/Chat (\d+)/); return match ? parseInt(match[1], 10) : 0; }).filter(num => num > 0);
      const nextNumber = existingNumbers.length > 0 ? Math.max(0, ...existingNumbers) + 1 : 1;
      const newChatTitle = `Chat ${nextNumber}`;

      const newChatData = {
        id: newChatFrontendId,
        title: newChatTitle,
        messages: [],
        userHasTyped: false,
        backendId: null, // O chat começa sem backendId
        createdAt: new Date().toISOString(),
      };
      return { ...prevChats, [newChatFrontendId]: newChatData };
    });
    setActiveChatId(newChatFrontendId);
  }, [isProcessingChatAction, isSidebarVisible]);

  // Carregamento Inicial de Chats do Backend
  useEffect(() => {
    const fetchChats = async () => {
      setIsProcessingChatAction(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) { navigate('/', { replace: true }); return; }
      var Name = localStorage.getItem('userFirstName'); 
      const storedFirstName = Name.toLowerCase();
      const storedAvatarUrl = localStorage.getItem('userAvatarUrl');
      setUserName(storedFirstName);
      setUserAvatar(storedAvatarUrl);
      try {
        // --- ALTERAÇÃO PRINCIPAL AQUI ---
        // A requisição GET agora é feita para o endpoint /chat
        const response = await fetch(`${API_BASE_URL}/chat-history`, {
          method: 'GET', // Adicionado para clareza, embora GET seja o padrão
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const serverChatsArray = await response.json();
          const chatsMap = serverChatsArray.reduce((acc, chat) => {
            const id = chat.id.toString(); // Usa o ID do backend como chave principal
            acc[id] = {
              id: id,
              backendId: chat.id,
              title: `Chat ${chat.id}`, // Garante um título consistente com o ID do backend
              messages: mapBackendMessagesToFrontend(chat.chat_messages?.messages || []),
              userHasTyped: (chat.chat_messages?.messages || []).some(m => m.role === 'user'),
              createdAt: chat.created_at,
            };
            return acc;
          }, {});
          
          setChats(chatsMap);
          const chatIds = Object.keys(chatsMap);
          if (chatIds.length > 0) {
            const lastActiveChatId = localStorage.getItem('lastActiveChatId');
            if (lastActiveChatId && chatsMap[lastActiveChatId]) {
              setActiveChatId(lastActiveChatId);
            } else {
              const sortedChats = Object.values(chatsMap).sort((a,b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
              setActiveChatId(sortedChats[0].id);
            }
          } else {
            setActiveChatId(null);
          }
        } else { throw new Error('Falha ao carregar histórico de chats.'); }
      } catch (error) {
        console.error("Erro ao carregar chats, usando localStorage como fallback:", error);
        const savedChats = JSON.parse(localStorage.getItem('chats')) || {};
        setChats(savedChats);
      } finally {
        setHasLoadedInitialChats(true);
        setIsProcessingChatAction(false);
      }
    };

    fetchChats();
  }, [navigate]);

  // Persistência no localStorage (funciona como um cache/backup)
  useEffect(() => {
    if (hasLoadedInitialChats) { localStorage.setItem('chats', JSON.stringify(chats)); }
  }, [chats, hasLoadedInitialChats]);

  useEffect(() => {
    if (activeChatId) { localStorage.setItem('lastActiveChatId', activeChatId); }
  }, [activeChatId]);

  // Cria um novo chat se a lista estiver vazia após o carregamento inicial
  useEffect(() => {
    if (hasLoadedInitialChats && Object.keys(chats).length === 0 && !isProcessingChatAction) {
      handleNewChat(true, true);
    }
  }, [chats, hasLoadedInitialChats, handleNewChat, isProcessingChatAction]);


  const handleSend = async () => {
    if (input.trim() === '' || !activeChatId || !chats[activeChatId]) return;
    
    const userMessage = { sender: 'user', text: input, id: uuidv4() };
    const currentInputForAPI = input;
    setInput('');
    const botMessageId = uuidv4();
    const currentChat = chats[activeChatId];
    const isNewChat = !currentChat.backendId;

    setChats(prev => ({
      ...prev,
      [activeChatId]: { ...prev[activeChatId], messages: [...prev[activeChatId].messages, userMessage, { sender: 'bot', text: '', id: botMessageId }], userHasTyped: true }
    }));

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Sessão expirou.');

      const payload = {
        message: currentInputForAPI,
        chat_history_id: currentChat.backendId,
      };
      
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Erro do servidor: ${response.statusText}`);
      }
      
      if (isNewChat) {
        const newBackendIdHeader = response.headers.get('X-Chat-History-ID'); // <<-- CONFIRME ESTE NOME COM O BACKEND
        if (newBackendIdHeader) {
          const newBackendId = parseInt(newBackendIdHeader, 10);
          const newBackendIdStr = newBackendId.toString();

          setChats(prev => {
            const tempChat = prev[activeChatId];
            if (!tempChat) return prev;
            const newState = {...prev};
            delete newState[activeChatId]; // Remove o chat com ID temporário
            
            const finalChat = {
              ...tempChat,
              id: newBackendIdStr, // Atualiza o ID principal para o do backend
              backendId: newBackendId,
              title: `Chat ${newBackendId}` // Atualiza o título com o ID real
            };
            newState[finalChat.id] = finalChat;

            // Transfere o placeholder da mensagem do bot para o chat finalizado
            const botMessagePlaceholder = tempChat.messages.find(m => m.id === botMessageId);
            if(botMessagePlaceholder) {
                finalChat.messages = [userMessage, botMessagePlaceholder];
            }
            
            setActiveChatId(finalChat.id); // Ativa o novo chat com o ID correto
            return newState;
          });
        }
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamDone = false;
      while (!streamDone) {
        const { value, done } = await reader.read();
        if (done) { streamDone = true; break; }
        const chunk = decoder.decode(value, { stream: true });
        for (let i = 0; i < chunk.length; i++) {
          const char = chunk[i];
          setChats(prev => {
            // Usa o ID ativo mais recente, que pode ter sido atualizado se for um novo chat
            const currentActiveId = activeChatId; 
            if (!prev[currentActiveId]?.messages.find(m => m.id === botMessageId)) return prev;

            const updatedMessages = prev[currentActiveId].messages.map(msg =>
              msg.id === botMessageId ? { ...msg, text: msg.text + char } : msg
            );
            return { ...prev, [currentActiveId]: { ...prev[currentActiveId], messages: updatedMessages }};
          });
          // Lógica de delay
          const currentLength = (chats[activeChatId]?.messages.find(m => m.id === botMessageId)?.text.length || 0) + 1;
          const delay = currentLength > ACCELERATION_THRESHOLD_CHARS ? ACCELERATED_TYPING_DELAY_MS : INITIAL_TYPING_DELAY_MS;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('Falha na comunicação com o chat:', error);
      alert(`Erro: ${error.message}`);
      if (error.message.includes("401")) navigate('/', { replace: true });
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processSendMessage(); }
  };

  const handleSelectChat = async (id) => {
    if (id === activeChatId) return;
    if (isSidebarVisible) {
      setIsSidebarVisible(false);
      await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }
    setActiveChatId(id);
  };

  const handleRenameChat = async (id) => {
    const chatToRename = chats[id];
    if (!chatToRename) return;

    const oldTitle = chatToRename.title;
    const newTitlePrompt = prompt('Digite o novo nome do chat:', oldTitle);

    if (newTitlePrompt && newTitlePrompt.trim() !== '' && newTitlePrompt.trim() !== oldTitle) {
      const newTitle = newTitlePrompt.trim();
      setChats(prev => ({ ...prev, [id]: { ...prev[id], title: newTitle } }));

      if (chatToRename.backendId) {
        console.warn("TODO: Implementar chamada PUT para renomear chat no backend para chatId:", chatToRename.backendId);
      }
    }
  };
  
  const handleDeleteChat = async (idToDelete) => {
    const chatToDelete = chats[idToDelete];
    if (!chatToDelete) { console.error("Chat não encontrado:", idToDelete); return; }
    
    const confirmed = window.confirm(`Tem certeza que deseja apagar o chat "${chatToDelete.title || 'sem título'}"?`);
    if (!confirmed) return;

    if (isSidebarVisible) {
        setIsSidebarVisible(false);
        await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }

    const backendChatId = chatToDelete.backendId;
    // Se não tiver backendId, apenas deleta localmente
    if (!backendChatId) {
      setChats(prev => {
        const updatedChats = { ...prev };
        delete updatedChats[idToDelete];
        if (activeChatId === idToDelete) { setActiveChatId(Object.keys(updatedChats).length > 0 ? Object.keys(updatedChats)[0] : null); }
        return updatedChats;
      });
      return;
    }

    setIsProcessingChatAction(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error("Sessão expirou.");
      // A deleção ainda deve usar o endpoint específico com o ID
      const response = await fetch(`${API_BASE_URL}/chat-history/${backendChatId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) { // 204 No Content
        setChats(prev => {
          const updatedChats = { ...prev };
          delete updatedChats[idToDelete];
          
          if (activeChatId === idToDelete) { setActiveChatId(Object.keys(updatedChats).length > 0 ? Object.keys(updatedChats)[0] : null); }
          console.log("deletado")
          const remainingBackendIds = Object.values(updatedChats)
                                          .map(chat => chat.backendId)
                                          .filter(id => id != null); // Garante que apenas IDs reais sejam logados
          console.log("IDs de backend ativos:", remainingBackendIds);
          return updatedChats;
        });
        
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Falha ao deletar: ${response.statusText}`);
      }
    } catch (error) {
      alert(error.message);
      if (error.message.includes("401")) { navigate('/', { replace: true }); }
    } finally {
      setIsProcessingChatAction(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    alert('Você foi deslogado!');
    navigate('/', { replace: true });
  };
  
  const shouldShowGreeting = activeChatId && chats[activeChatId] && chats[activeChatId].messages.length === 0 && !chats[activeChatId].userHasTyped;
                                
  return (
    <div className={`app-container ${isLightMode ? 'light-mode' : 'dark-mode'}`}>
      <div className={`sidebar ${isSidebarVisible ? '' : 'collapsed'}`}>
        <div className="sidebar-header"><span>ChatEdu POLI</span></div>
        <button className="new-chat-button" onClick={() => handleNewChat(false, false)} disabled={isProcessingChatAction}>+ Novo Chat</button>
        <div className="chat-history-list">
          {Object.values(chats)
            .sort((chatA, chatB) => (Date.parse(chatB.createdAt) || 0) - (Date.parse(chatA.createdAt) || 0))
            .map((chat) => (
            <div key={chat.id} className={`chat-entry ${chat.id === activeChatId ? 'active' : ''}`}>
              <div className="chat-history-button" onClick={() => handleSelectChat(chat.id)} title={chat.title}>{chat.title}</div>
              {chat.id === activeChatId && (
                <div className="chat-icons">
                  <img src={renameIcon} alt="Renomear" title="Renomear" className="chat-icon" onClick={(e) => { e.stopPropagation(); handleRenameChat(chat.id);}} />
                  <img src={deleteIcon} alt="Excluir" title="Excluir" className="chat-icon" onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id);}} />
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
                {activeChatId && chats[activeChatId] ? chats[activeChatId].title : "ChatEdu"}
            </span>
          </div>
          <div className="main-panel-header-right">
            <button className="theme-toggle-header" onClick={() => setIsLightMode(prev => !prev)}>{isLightMode ? '🌙' : '☀️'}</button>
            <div className="user-menu-wrapper-header">
              <button className="user-icon-header" onClick={() => setShowUserMenu(prev => !prev)}>
                {userAvatar ? (
                  <img src={userAvatar} alt={`Avatar de ${userName}`} className="user-avatar-image" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </button>
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
          {activeChatId && chats[activeChatId] ? (
            shouldShowGreeting ? (
                <div className="greeting-message-container" key={`greeting-${activeChatId}`}>
                    <h1 className="greeting-message">Olá, {userName}</h1>
                    <p className="greeting-submessage">Como posso te ajudar hoje?</p>
                </div>
            ) : (
                <div className="chat-messages" key={activeChatId}>
                    {chats[activeChatId].messages.map((msg) => (
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
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Digite sua mensagem..." className="chat-input" rows="1" disabled={!activeChatId || isLoading || isProcessingChatAction} />
            <button onClick={processSendMessage} className="send-button" disabled={!activeChatId || !input.trim() || isLoading || isProcessingChatAction}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ChatPage;