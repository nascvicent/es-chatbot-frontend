import '../styles/Login.css';
import logoPoli from '../assets/headermobile.png';

function Login() {
  const handleGoogleLogin = () => {
    console.log("Login com Google");
  };

  return (
    <div className="page-wrapper">
      <div className="login-container">
        <div className="left-section">
          <img src={logoPoli} alt="Logo da UPE" className="logo" />
          <h2 className="poppins">Bem-vindo ao Chatbot Educacional</h2>
          <p className="poppins">Acesse sua conta para continuar aprendendo com a gente.</p>
        </div>

        <div className="right-section">
          <div className="login-card">
            <h2 className="poppins">Entre com seu email institucional</h2>
            <button className="google-btn" onClick={handleGoogleLogin}>
              <img
                src="https://img.icons8.com/color/20/000000/google-logo.png"
                alt="Google"
              />
              Entrar com Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
