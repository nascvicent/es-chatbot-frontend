import { useState, useEffect } from 'react'
import '../styles/ChatPage.css'
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLightMode, setIsLightMode] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Tema
  useEffect(() => {
    document.body.className = isLightMode ? 'light-mode' : ''
  }, [isLightMode])

  // Mensagem inicial
  useEffect(() => {
    setMessages([
      {
        sender: 'bot',
        text: 'Como posso te ajudar?',
      },
    ])
  }, [])

  const handleSend = () => {
    if (input.trim() === '') return

    const userMessage = { sender: 'user', text: input }
    const botMessage = {
      sender: 'bot',
      text: `Você disse: "${input}". Estou simulando uma resposta aqui.`,
    }

    setMessages((prev) => [...prev, userMessage, botMessage])
    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const fileContent = event.target.result

      const userMessage = {
        sender: 'user',
        text: `📎 Enviado o arquivo: ${file.name}`,
      }

      const botMessage = {
        sender: 'bot',
        text: `O conteúdo do arquivo "${file.name}" é:\n${fileContent}`,
      }

      setMessages((prev) => [...prev, userMessage, botMessage])
    }

    reader.readAsText(file)
  }

  const handleLogout = () => {
    alert('Você foi deslogado!')
    navigate('/')
  }

  return (
    <div className="chat-page">
      <button className="theme-toggle" onClick={() => setIsLightMode((prev) => !prev)}>
        {isLightMode ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
      </button>

      <div className="user-menu-wrapper">
        <button
          className="user-icon"
          onClick={() => setShowUserMenu((prev) => !prev)}
        >
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
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}
          >
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
        <label htmlFor="file-upload" className="file-upload-label">
          Enviar Arquivo
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="file-upload-input"
        />
      </div>
    </div>
  )
}

export default App
