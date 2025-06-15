import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../styles/ChatPage.css';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  Bot, 
  Hand, 
  GraduationCap, 
  Sparkles, 
  LogOut, 
  Copy, 
  Check,
  Menu,
  Sun,
  Moon,
  AlertTriangle,
  AlertCircle,
  Settings
} from 'lucide-react';
import renameIcon from '../assets/rename.png';
import deleteIcon from '../assets/delete.png';

// --- Constantes ---
const INITIAL_TYPING_DELAY_MS = 5;
const ACCELERATED_TYPING_DELAY_MS = 5;
const ACCELERATION_THRESHOLD_CHARS = 80;
const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;
const SIDEBAR_ANIMATION_DELAY = 300;

// --- Componente de Indicador de Digitação ---
const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="typing-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <span className="typing-text">ChatEdu está digitando...</span>
  </div>
);

// --- Componente de Indicador de Busca de Documentos ---
const DocumentSearchIndicator = () => (
  <div className="document-search-indicator">
    <div className="search-spinner">
      <div className="spinner-ring"></div>
    </div>
    <span className="search-text">Procurando documentos relevantes...</span>
  </div>
);

// --- Componente de Bloco de Código ---
const CodeBlock = ({ children, className, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const code = String(children).replace(/\n$/, '');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar código:', err);
    }
  };

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-language">{language}</span>
        <button 
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={copyToClipboard}
          title={copied ? 'Copiado!' : 'Copiar código'}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span className="copy-text">{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          background: '#1e1e1e'
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

// --- Componente de Código Inline ---
const InlineCode = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const code = String(children);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Falha ao copiar código:', err);
    }
  };

  return (
    <span className="inline-code-container">
      <code className="inline-code" {...props}>
        {children}
      </code>
      <button 
        className={`inline-copy-button ${copied ? 'copied' : ''}`}
        onClick={copyToClipboard}
        title={copied ? 'Copiado!' : 'Copiar'}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </span>
  );
};

// --- Componente de Mensagem ---
const Message = ({ message, isLatest }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`message ${message.sender} ${isVisible ? 'visible' : ''} ${isLatest ? 'latest' : ''}`}>
      {message.sender === 'bot' ? (
        <div className="bot-message-content">
          <div className="bot-avatar">
            <Bot size={20} />
          </div>
          <div className="bot-text">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code({node, inline, className, children, ...props}) {
                  return !inline ? (
                    <CodeBlock className={className} {...props}>
                      {children}
                    </CodeBlock>
                  ) : (
                    <InlineCode {...props}>
                      {children}
                    </InlineCode>
                  )
                }
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="user-message-content">
          <div className="user-text">
            {message.text.split('\n').map((line, i) => (<span key={i}>{line}<br/></span>))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Componente de Lista de Chats ---
const ChatList = ({ chats, activeChatId, onSelectChat, onRenameChat, onDeleteChat, isProcessing }) => {
  const sortedChats = Object.values(chats)
    .sort((chatA, chatB) => (Date.parse(chatB.createdAt) || 0) - (Date.parse(chatA.createdAt) || 0));

  return (
    <div className="chat-history-list">
      {sortedChats.map((chat) => (
        <div key={chat.id} className={`chat-entry ${chat.id === activeChatId ? 'active' : ''}`}>
          <div 
            className="chat-history-button" 
            onClick={() => onSelectChat(chat.id)} 
            title={chat.title}
          >
            {chat.title}
          </div>
          {chat.id === activeChatId && (
            <div className="chat-icons">
              <img 
                src={renameIcon} 
                alt="Renomear" 
                title="Renomear" 
                className="chat-icon" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onRenameChat(chat.id);
                }} 
              />
              <img 
                src={deleteIcon} 
                alt="Excluir" 
                title="Excluir" 
                className="chat-icon" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onDeleteChat(chat.id);
                }} 
              />
            </div>
          )}
        </div>
      ))}
      {sortedChats.length === 0 && !isProcessing && (
        <div className="empty-chat-list">
          <p>Nenhum chat ainda</p>
          <p>Comece uma conversa!</p>
        </div>
      )}
    </div>
  );
};

// --- Componente de Saudação ---
const WelcomeMessage = ({ userName, onExampleClick }) => {
  const examplePrompts = [
    'Me explique os princípios SOLID',
    'Crie um exemplo de Singleton em Python',
    'Quais as diferenças entre REST e GraphQL?',
    '/desafio estruturas de dados'
  ];

  return (
    <div className="greeting-message-container">
      <div className="welcome-header">
        <h1 className="greeting-message">
          Olá, {userName}! 
        </h1>
        <p className="greeting-submessage">Como posso te ajudar hoje?</p>
      </div>
      <div className="example-prompts">
        {examplePrompts.map((prompt, index) => (
          <div 
            key={index}
            className="prompt-card"
            onClick={() => onExampleClick(prompt)}
          >
            {index === 3 ? (
              <p>Use <strong>/desafio</strong> para pedir um desafio sobre um tema</p>
            ) : (
              <p>{prompt}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Componente de Input Inteligente ---
const ChatInput = ({ 
  value, 
  onChange, 
  onSend, 
  disabled, 
  isLoading, 
  placeholder = "Digite sua mensagem..." 
}) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="input-area-wrapper">
      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="chat-input"
          rows="1"
          disabled={disabled}
          maxLength={4000}
        />
        <div className="input-actions">
          <span className="char-counter">{value.length}/4000</span>
          <button 
            onClick={onSend} 
            className={`send-button ${value.trim() ? 'active' : ''}`}
            disabled={disabled || !value.trim()}
            title="Enviar mensagem (Enter)"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Funções Auxiliares ---
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
  const [isSearchingDocuments, setIsSearchingDocuments] = useState(false);
  const [isProcessingChatAction, setIsProcessingChatAction] = useState(false);
  const [hasLoadedInitialChats, setHasLoadedInitialChats] = useState(false);
  const [userName, setUserName] = useState("Usuário");
  const [userAvatar, setUserAvatar] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [userRole, setUserRole] = useState(null);

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

  // Verificação de conexão
  useEffect(() => {
    const checkConnection = () => {
      setConnectionStatus(navigator.onLine ? 'connected' : 'disconnected');
    };

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  const handleExamplePromptClick = (prompt) => {
    setInput(prompt);
    // Auto-focus no input após clicar em um exemplo
    setTimeout(() => {
      const inputElement = document.querySelector('.chat-input');
      inputElement?.focus();
    }, 100);
  };

  const handleNewChat = useCallback(async (isInitial = false, suppressSidebarClose = false) => {
    if (isProcessingChatAction) return;

    if (!suppressSidebarClose && isSidebarVisible) {
      setIsSidebarVisible(false);
      await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }

    const newChatFrontendId = `local_${uuidv4()}`;
    setChats(prevChats => {
      const nextNumber = Object.keys(prevChats).length + 1;
      const newChatTitle = `Chat ${nextNumber}`;

      const newChatData = {
        id: newChatFrontendId,
        title: newChatTitle,
        messages: [],
        userHasTyped: false,
        backendId: null,
        createdAt: new Date().toISOString(),
      };
      return { ...prevChats, [newChatFrontendId]: newChatData };
    });
    setActiveChatId(newChatFrontendId);
  }, [isProcessingChatAction, isSidebarVisible]);

  // Carregamento inicial
  useEffect(() => {
    const fetchChats = async () => {
      setIsProcessingChatAction(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) { 
        navigate('/', { replace: true }); 
        return; 
      }

      let displayName = "Usuário"; 
      const fullName = localStorage.getItem('userFirstName');
      
      if (fullName) {
        const firstName = fullName.split(' ')[0];
        displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      }

      const storedAvatarUrl = localStorage.getItem('userAvatarUrl');
      const storedUserRole = localStorage.getItem('userRole');
      
      setUserName(displayName); 
      setUserAvatar(storedAvatarUrl);
      setUserRole(storedUserRole);

      try {
        const response = await fetch(`${API_BASE_URL}/chat-history`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const serverChatsArray = await response.json();
          const sortedServerChats = serverChatsArray.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );

          const chatsMap = sortedServerChats.reduce((acc, chat, index) => {
            const id = chat.id.toString();
            acc[id] = {
              id: id,
              backendId: chat.id,
              title: `Chat ${index + 1}`,
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
        } else { 
          throw new Error('Falha ao carregar histórico de chats.'); 
        }
      } catch (error) {
        console.error("Erro ao carregar chats:", error);
        setConnectionStatus('error');
        const savedChats = JSON.parse(localStorage.getItem('chats')) || {};
        setChats(savedChats);
      } finally {
        setHasLoadedInitialChats(true);
        setIsProcessingChatAction(false);
      }
    };

    fetchChats();
  }, [navigate]);

  // Persistência local
  useEffect(() => {
    if (hasLoadedInitialChats) { 
      localStorage.setItem('chats', JSON.stringify(chats)); 
    }
  }, [chats, hasLoadedInitialChats]);

  useEffect(() => {
    if (activeChatId) { 
      localStorage.setItem('lastActiveChatId', activeChatId); 
    }
  }, [activeChatId]);

  // Criar chat inicial se necessário
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
      [activeChatId]: { 
        ...prev[activeChatId], 
        messages: [...prev[activeChatId].messages, userMessage, { sender: 'bot', text: '', id: botMessageId }], 
        userHasTyped: true 
      }
    }));

    setIsSearchingDocuments(true);
    setIsLoading(true);
    let finalActiveChatId = activeChatId; 

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Sessão expirou.');

      let chatHistoryIdForRequest = currentChat.backendId;

      if (isNewChat) {
        const createChatResponse = await fetch(`${API_BASE_URL}/chat-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
          body: JSON.stringify({ chat_messages: { messages: [] } })
        });

        if (!createChatResponse.ok) {
          const errorData = await createChatResponse.json().catch(() => null);
          throw new Error(errorData?.detail || `Falha ao criar o chat: ${createChatResponse.statusText}`);
        }

        const newChatData = await createChatResponse.json();
        const newBackendId = newChatData.id;
        chatHistoryIdForRequest = newBackendId;
        const newBackendIdStr = newBackendId.toString();
        finalActiveChatId = newBackendIdStr;

        setChats(prev => {
          const tempChat = prev[activeChatId];
          if (!tempChat) return prev;

          const newState = { ...prev };
          delete newState[activeChatId];

          const finalChat = {
            ...tempChat,
            id: newBackendIdStr,
            backendId: newBackendId,
          };
          newState[finalChat.id] = finalChat;
          return newState;
        });
        setActiveChatId(newBackendIdStr);
      }

      const payload = {
        message: currentInputForAPI,
        chat_history_id: chatHistoryIdForRequest,
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'text/event-stream', 
          'Authorization': `Bearer ${accessToken}` 
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Erro do servidor: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamDone = false;
      let currentBotMessageLength = 0; 

      // Quando o streaming começar, pare de mostrar "procurando documentos"
      setIsSearchingDocuments(false);

      while (!streamDone) {
        const { value, done } = await reader.read();
        if (done) { streamDone = true; break; }
        const chunk = decoder.decode(value, { stream: true });
        for (const char of chunk) {
          setChats(prev => {
            const currentActiveChat = prev[finalActiveChatId];
            if (!currentActiveChat?.messages.find(m => m.id === botMessageId)) return prev;

            const updatedMessages = currentActiveChat.messages.map(msg =>
              msg.id === botMessageId ? { ...msg, text: msg.text + char } : msg
            );
            return { ...prev, [finalActiveChatId]: { ...currentActiveChat, messages: updatedMessages } };
          });
          currentBotMessageLength++;
          const delay = currentBotMessageLength > ACCELERATION_THRESHOLD_CHARS ? ACCELERATED_TYPING_DELAY_MS : INITIAL_TYPING_DELAY_MS;
          if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('Falha na comunicação com o chat:', error);
      setConnectionStatus('error');
      
      // Mostrar toast de erro ao invés de alert
      const errorToast = document.createElement('div');
      errorToast.className = 'error-toast';
      errorToast.textContent = `Erro: ${error.message}`;
      document.body.appendChild(errorToast);
      setTimeout(() => errorToast.remove(), 5000);
      
      setInput(currentInputForAPI); 
      setChats(prev => {
        const chat = prev[finalActiveChatId]; 
        if (!chat) return prev;

        const revertedMessages = chat.messages.filter(
          m => m.id !== userMessage.id && m.id !== botMessageId
        );

        return {
          ...prev,
          [chat.id]: { ...chat, messages: revertedMessages }
        };
      });

      if (error.message.includes("401")) navigate('/', { replace: true });
    } finally {
      setIsLoading(false);
      setIsSearchingDocuments(false);
      setConnectionStatus('connected');
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
    if (!chatToDelete) { 
      console.error("Chat não encontrado:", idToDelete); 
      return; 
    }
    
    const confirmed = window.confirm(`Tem certeza que deseja apagar o chat "${chatToDelete.title || 'sem título'}"?`);
    if (!confirmed) return;

    if (isSidebarVisible) {
      setIsSidebarVisible(false);
      await new Promise(resolve => setTimeout(resolve, SIDEBAR_ANIMATION_DELAY));
    }

    const backendChatId = chatToDelete.backendId;
    if (!backendChatId) {
      setChats(prev => {
        const updatedChats = { ...prev };
        delete updatedChats[idToDelete];
        if (activeChatId === idToDelete) { 
          setActiveChatId(Object.keys(updatedChats).length > 0 ? Object.keys(updatedChats)[0] : null); 
        }
        return updatedChats;
      });
      return;
    }

    setIsProcessingChatAction(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error("Sessão expirou.");
      
      const response = await fetch(`${API_BASE_URL}/chat-history/${backendChatId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        setChats(prev => {
          const updatedChats = { ...prev };
          delete updatedChats[idToDelete];
          
          if (activeChatId === idToDelete) { 
            setActiveChatId(Object.keys(updatedChats).length > 0 ? Object.keys(updatedChats)[0] : null); 
          }
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

  const handleNavigateToDashboard = () => {
    setShowUserMenu(false);
    navigate('/dashboard');
  };
  
  const shouldShowGreeting = activeChatId && chats[activeChatId] && chats[activeChatId].messages.length === 0 && !chats[activeChatId].userHasTyped;
  const currentChat = activeChatId ? chats[activeChatId] : null;
                                
  return (
    <div className={`app-container ${isLightMode ? 'light-mode' : 'dark-mode'}`}>
      {/* Status de Conexão */}
      {connectionStatus !== 'connected' && (
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'disconnected' && (
            <>
              <AlertTriangle size={16} />
              <span>Sem conexão com a internet</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <AlertCircle size={16} />
              <span>Erro na conexão com o servidor</span>
            </>
          )}
        </div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarVisible ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <span>ChatEdu POLI</span>
        </div>
        
        <button 
          className="new-chat-button" 
          onClick={() => handleNewChat(false, false)} 
          disabled={isProcessingChatAction}
        >
          <Sparkles size={16} />
          Novo Chat
        </button>
        
        <ChatList 
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          isProcessing={isProcessingChatAction}
        />
        
        <div className="sidebar-footer">
          <div className="sidebar-stats">
            <small>{Object.keys(chats).length} conversas</small>
          </div>
        </div>
      </div>

      {/* Painel Principal */}
      <div className="main-panel">
        {/* Header */}
        <div className="main-panel-header">
          <div className="main-panel-header-left">
                           <button 
                className="menu-toggle-main" 
                onClick={() => setIsSidebarVisible(prev => !prev)}
                title="Menu"
              >
                <Menu size={24} />
              </button>
            <span className="main-panel-title">
              {currentChat ? currentChat.title : "ChatEdu"}
            </span>
          </div>
          
          <div className="main-panel-header-right">
                         <button 
               className="theme-toggle-header" 
               onClick={() => setIsLightMode(prev => !prev)}
               title={isLightMode ? 'Modo escuro' : 'Modo claro'}
             >
               {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
             </button>
            
            <div className="user-menu-wrapper-header">
              <button 
                className={`user-icon-header ${userRole === 'admin' ? 'admin-user' : ''}`}
                onClick={() => setShowUserMenu(prev => !prev)}
                title={userRole === 'admin' ? 'Menu do administrador' : 'Menu do usuário'}
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={`Avatar de ${userName}`} className="user-avatar-image" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
                {userRole === 'admin' && (
                  <div className="admin-badge">
                    <Settings size={10} />
                  </div>
                )}
              </button>
              
                            {showUserMenu && (
                <div className="user-menu-header">
                  <div className="user-info">
                    <p><strong>Usuário:</strong> {userName}</p>
                    {userRole === 'admin' && (
                      <p className="user-role"><strong>Role:</strong> Administrador</p>
                    )}
                  </div>
                  
                  <div className="user-menu-actions">
                    {userRole === 'admin' && (
                      <button className="dashboard-button-header" onClick={handleNavigateToDashboard}>
                        <Settings size={16} />
                        Dashboard
                      </button>
                    )}
                    <button className="logout-button-header" onClick={handleLogout}>
                      <LogOut size={16} />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo do Chat */}
        <div className="chat-content">
          {currentChat ? (
            shouldShowGreeting ? (
              <WelcomeMessage 
                userName={userName}
                onExampleClick={handleExamplePromptClick}
              />
            ) : (
              <div className="chat-messages">
                {currentChat.messages.map((msg, index) => (
                  <Message 
                    key={msg.id} 
                    message={msg} 
                    isLatest={index === currentChat.messages.length - 1}
                  />
                ))}
                {isSearchingDocuments && <DocumentSearchIndicator />}
                {isLoading && !isSearchingDocuments && <TypingIndicator />}
                <div ref={chatMessagesEndRef} />
              </div>
            )
                     ) : (
             <div className="greeting-message-container">
               <h1 className="greeting-message">
                 Bem-vindo ao ChatEdu! <GraduationCap size={36} />
               </h1>
               <p className="greeting-submessage">Crie um novo chat ou selecione um para começar.</p>
             </div>
           )}
        </div>

        {/* Área de Input */}
        <ChatInput 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSend={processSendMessage}
          disabled={!activeChatId || isLoading || isProcessingChatAction}
          isLoading={isLoading}
          placeholder={
            !activeChatId 
              ? "Crie um novo chat para começar..." 
              : connectionStatus !== 'connected'
              ? "Verifique sua conexão..."
              : "Digite sua mensagem..."
          }
        />
      </div>
    </div>
  );
}

export default ChatPage;
