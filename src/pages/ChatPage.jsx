import { useState, useEffect } from 'react'
import '../styles/ChatPage.css'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import renameIcon from '../assets/rename.png'
import deleteIcon from '../assets/delete.png'

function App() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [isLightMode, setIsLightMode] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [chats, setChats] = useState({})
  const [activeChatId, setActiveChatId] = useState(null)

  useEffect(() => {
    document.body.className = isLightMode ? 'light-mode' : ''
  }, [isLightMode])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('chats')) || {}
    setChats(saved)
    const ids = Object.keys(saved)
    if (ids.length > 0) setActiveChatId(ids[0])
    else handleNewChat()
  }, [])

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats))
  }, [chats])

  const currentMessages = chats[activeChatId]?.messages || []

  const handleSend = () => {
    if (input.trim() === '') return
    const userMessage = { sender: 'user', text: input }
    const botMessage = {
      sender: 'bot',
      text: `Você disse: "${input}". Estou simulando uma resposta aqui.`,
    }
    const updatedChat = {
      ...chats[activeChatId],
      messages: [...currentMessages, userMessage, botMessage],
    }
    setChats({ ...chats, [activeChatId]: updatedChat })
    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  const handleNewChat = () => {
  const existingNumbers = Object.values(chats)
    .map(chat => {
      const match = chat.title.match(/Chat (\d+)/)
      return match ? parseInt(match[1]) : 0
    })
  const max = existingNumbers.length ? Math.max(...existingNumbers) : 0

  const id = uuidv4()
  const newChat = {
    id,
    title: `Chat ${max + 1}`,
    messages: [
      {
        sender: 'bot',
        text: 'Como posso te ajudar?',
      },
    ],
  }
  setChats({ ...chats, [id]: newChat })
  setActiveChatId(id)
}

  const handleSelectChat = (id) => {
    setActiveChatId(id)
  }

  const handleRenameChat = (id) => {
    const newTitle = prompt('Digite o novo nome do chat:', chats[id].title)
    if (newTitle && newTitle.trim() !== '') {
      const updatedChat = { ...chats[id], title: newTitle.trim() }
      setChats({ ...chats, [id]: updatedChat })
    }
  }

  const handleDeleteChat = (id) => {
  const confirmed = confirm('Tem certeza que deseja apagar este chat?')
  if (confirmed) {
    const updatedChats = { ...chats }
    delete updatedChats[id]
    const remainingIds = Object.keys(updatedChats)
    setChats(updatedChats)

    if (remainingIds.length > 0) {
      setActiveChatId(remainingIds[0])
    } else {
      // zera os chats e cria o "Chat 1"
      const newId = uuidv4()
      const newChat = {
        id: newId,
        title: 'Chat 1',
        messages: [
          {
            sender: 'bot',
            text: 'Como posso te ajudar?',
          },
        ],
      }
      const newChats = { [newId]: newChat }
      setChats(newChats)
      setActiveChatId(newId)
    }
  }
}


  const handleLogout = () => {
    alert('Você foi deslogado!')
    navigate('/')
  }

  return (
    <div className="chat-page">
      <div className="sidebar">
        <button className="new-chat-button" onClick={handleNewChat}>+ Novo Chat</button>

        {Object.entries(chats).map(([id, chat]) => (
  <div key={id} className="chat-entry">
    <div
      className={`chat-history-button ${id === activeChatId ? 'active' : ''}`}
      onClick={() => handleSelectChat(id)}
    >
      {chat.title}
    </div>
    <div className="chat-icons">
      <img
  src={renameIcon}
  alt="Renomear"
  title="Renomear"
  className="chat-icon"
  onClick={() => handleRenameChat(id)}
/>
<img
  src={deleteIcon}
  alt="Excluir"
  title="Excluir"
  className="chat-icon"
  onClick={() => handleDeleteChat(id)}
/>

    </div>
  </div>
))}

      </div>

      <button className="theme-toggle" onClick={() => setIsLightMode((prev) => !prev)}>
        {isLightMode ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
      </button>

      <div className="user-menu-wrapper">
        <button className="user-icon" onClick={() => setShowUserMenu((prev) => !prev)}>
          👤
        </button>
        {showUserMenu && (
          <div className="user-menu">
            <p><strong>Usuário:</strong> João</p>
            <button className="logout-button" onClick={handleLogout}>Sair</button>
          </div>
        )}
      </div>

      <h1 className="chat-header">Chatbot Educacional POLI</h1>

      <div className="chat-messages">
        {currentMessages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Digite sua mensagem..."
          className="chat-input"
        />
        <button onClick={handleSend} className="send-button">
          Enviar
        </button>
      </div>
    </div>
  )
}

export default App
