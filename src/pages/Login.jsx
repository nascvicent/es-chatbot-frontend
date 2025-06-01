import { motion } from 'framer-motion';
import React from 'react';
import '../styles/Login.css';
import logoPoli from '../assets/upelogobased.png';


function Login() {
  const backendUrl = 'https://es-chatbot-production.up.railway.app/auth/login'; 

  const handleGoogleLogin = () => {
    window.location.href = backendUrl;
  };

  return (
    <motion.div
      className="login-page-wrapper"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5 }}
    >
      <div className="login-container">
        <div className="left-section">
          <img src={logoPoli} alt="Logo da UPE" className="logo" />
          <h2 className="poppins">Bem-vindo ao Chatbot Educacional POLI</h2>
          <p className="poppins">Acesse sua conta para continuar aprendendo com a gente.</p>
        </div>

        <div className="right-section">
          <div className="login-form">
            <h2 className="poppins">Entre com seu email institucional</h2>
            <button className="google-btn" onClick={handleGoogleLogin}>
              <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="Google" />
              Entrar com o Google
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;
