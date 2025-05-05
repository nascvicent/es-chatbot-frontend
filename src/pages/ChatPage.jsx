import { useState } from 'react'
import '../styles/ChatPage.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() === '') return

    // mensagem do user
    const userMessage = { sender: 'user', text: input }

    // mensagem simulada da IA
    const botMessage = {
      sender: 'bot',
      text: `Você disse: "${input}". Estou simulando uma resposta aqui.`,
    }

    // atualiza lista de mensagens
    setMessages((prev) => [...prev, userMessage, botMessage])
    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <div className="chat-page">
      <h1 className="chat-header">Chatbot</h1>
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
        <button
          onClick={handleSend}
          className="send-button"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

export default App
