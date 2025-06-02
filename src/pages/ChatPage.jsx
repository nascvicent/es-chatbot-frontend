import { useState, useEffect } from 'react';
import '../styles/ChatPage.css'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import renameIcon from '../assets/rename.png'; // Ensure these paths are correct
import deleteIcon from '../assets/delete.png';
import menuIcon from '../assets/menu.png';

function ChatPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chats, setChats] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const userName = "marsim"; // Using "marsim" for the greeting

  useEffect(() => {
    document.body.className = isLightMode ? 'light-mode' : 'dark-mode';
  }, [isLightMode]);

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('chats')) || {};
    setChats(savedChats);
    const chatIds = Object.keys(savedChats);
    if (chatIds.length > 0) {
      setActiveChatId(chatIds[0]);
    } else {
      handleNewChat(true); // Create initial chat if none exist
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  const currentMessages = chats[activeChatId]?.messages || [];

  const handleSend = () => {
    if (input.trim() === '') return;
    const userMessage = { sender: 'user', text: input };
    const botMessage = {
      sender: 'bot',
      text: `Você disse: "${input}". Estou simulando uma resposta aqui.`,
    };
    const updatedChat = {
      ...chats[activeChatId],
      messages: [...(chats[activeChatId]?.messages || []), userMessage, botMessage],
      userHasTyped: true, // Mark that user has typed in this chat
    };
    setChats({ ...chats, [activeChatId]: updatedChat });
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = (isInitial = false) => {
    const existingNumbers = Object.values(chats)
      .map(chat => {
        const match = chat.title.match(/Chat (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const id = uuidv4();

    if (isInitial) {
        const initialChat = {
            id,
            title: `Chat 1`,
            messages: [], // Start with no messages to show greeting
            userHasTyped: false,
        };
        setChats({ [id]: initialChat });
        setActiveChatId(id);
    } else {
        const newChat = {
            id,
            title: `Chat ${nextNumber}`,
            messages: [
                {
                    sender: 'bot',
                    text: 'Como posso te ajudar?',
                },
            ],
            userHasTyped: false,
        };
        setChats(prevChats => ({ ...prevChats, [id]: newChat }));
        setActiveChatId(id);
    }
  };


  const handleSelectChat = (id) => {
    setActiveChatId(id);
  };

  const handleRenameChat = (id) => {
    const newTitle = prompt('Digite o novo nome do chat:', chats[id].title);
    if (newTitle && newTitle.trim() !== '') {
      const updatedChat = { ...chats[id], title: newTitle.trim() };
      setChats({ ...chats, [id]: updatedChat });
    }
  };

  const handleDeleteChat = (id) => {
    const confirmed = window.confirm('Tem certeza que deseja apagar este chat?');
    if (confirmed) {
      const updatedChats = { ...chats };
      delete updatedChats[id];
      const remainingIds = Object.keys(updatedChats);
      setChats(updatedChats);

      if (activeChatId === id) {
        if (remainingIds.length > 0) {
          setActiveChatId(remainingIds[0]);
        } else {
          handleNewChat(true);
        }
      } else if (remainingIds.length === 0) {
        handleNewChat(true);
      }
    }
  };

  const handleLogout = () => {
    alert('Você foi deslogado!');
    navigate('/');
  };

  // Updated condition for showing greeting
  const shouldShowGreeting = activeChatId &&
                           (!chats[activeChatId] ||
                            chats[activeChatId].messages.length === 0 ||
                            !chats[activeChatId].userHasTyped);


  return (
    <div className={`app-container ${isLightMode ? 'light-mode' : 'dark-mode'}`}>
      {/* SIDEBAR */}
      <div className={`sidebar ${isSidebarVisible ? 'visible' : 'collapsed'}`}>
        <div className="sidebar-header">
          <span>ChatBot Educacional POLI</span>
        </div>
        <button className="new-chat-button" onClick={() => handleNewChat()}>
          + Novo Chat
        </button>
        <div className="chat-history-list">
          {Object.entries(chats).map(([id, chat]) => (
            <div key={id} className={`chat-entry ${id === activeChatId ? 'active' : ''}`}>
              <div
                className="chat-history-button"
                onClick={() => handleSelectChat(id)}
                title={chat.title}
              >
                {chat.title}
              </div>
              <div className="chat-icons">
                <img
                  src={renameIcon}
                  alt="Renomear"
                  title="Renomear"
                  className="chat-icon"
                  onClick={(e) => { e.stopPropagation(); handleRenameChat(id);}}
                />
                <img
                  src={deleteIcon}
                  alt="Excluir"
                  title="Excluir"
                  className="chat-icon"
                  onClick={(e) => { e.stopPropagation(); handleDeleteChat(id);}}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          {/* Elements moved from here to main-panel-header-right */}
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="main-panel">
        <div className="main-panel-header">
          <div className="main-panel-header-left">
            <button className="menu-toggle-main" onClick={() => setIsSidebarVisible(prev => !prev)}>
              <img src={menuIcon} alt="Menu" className="menu-icon-main" />
            </button>
            <span className="main-panel-title">{chats[activeChatId]?.title || "Chat"}</span>
          </div>
          <div className="main-panel-header-right">
            <button className="theme-toggle-header" onClick={() => setIsLightMode(prev => !prev)}>
              {isLightMode ? '🌙' : '☀️'} {/* Using icons for brevity */}
            </button>
            <div className="user-menu-wrapper-header">
              <button className="user-icon-header" onClick={() => setShowUserMenu(prev => !prev)}>
                👤 {/* Could be user initial or image */}
              </button>
              {showUserMenu && (
                <div className="user-menu-header"> {/* Changed class name */}
                  <p><strong>Usuário:</strong> {userName}</p> {/* Using userName variable */}
                  <button className="logout-button-header" onClick={handleLogout}>Sair</button> {/* Changed class name */}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="chat-content">
          {shouldShowGreeting ? (
            <div className="greeting-message-container">
              <h1 className="greeting-message">Olá, {userName}</h1>
              <p className="greeting-submessage">Como posso te ajudar hoje?</p>
            </div>
          ) : (
            <div className="chat-messages">
              {currentMessages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-area-wrapper">
          <div className="chat-input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="chat-input"
              rows="1"
            />
            <button onClick={handleSend} className="send-button" disabled={!input.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;