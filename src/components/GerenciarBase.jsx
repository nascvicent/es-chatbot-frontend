import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiUploadCloud, FiFileText, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import "../styles/GerenciadorBase.css"; // Usaremos o novo CSS

const API_URL = 'https://es-chatbot-production.up.railway.app/document';

export default function GerenciarBase() {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false); // Novo estado para o visual do drag-and-drop
  const fileInputRef = useRef(null); // Referência para o input escondido

  // Suas funções de lógica (fetchDocuments, handleUpload, handleDelete) permanecem exatamente as mesmas
  const fetchDocuments = useCallback(async () => {
    setIsFetching(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/documents`);
      if (response.status === 404) {
        setDocuments([]);
        return;
      }
      if (!response.ok) {
        throw new Error('Falha ao buscar os documentos.');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError('Não foi possível carregar a lista de documentos.');
      console.error(err);
      setDocuments([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  
  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError('');
      setSuccess('');
    } else {
      setFile(null);
      setError("Por favor, selecione um arquivo no formato PDF.");
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError("Nenhum arquivo selecionado.");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError("Usuário não autenticado. Faça o login novamente.");
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Falha no upload do arquivo.');
      }
      const newDocument = await response.json();
      await fetchDocuments();
      setSuccess(`"${newDocument.name}" foi adicionado com sucesso!`);
      setFile(null); // Limpa o arquivo da lista de "prontos para upload"
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (g_file_id, docName) => {
    if (!window.confirm(`Tem certeza que deseja deletar o arquivo "${docName}"?`)) {
      return;
    }
    // Usando um estado de loading específico para o item seria o ideal, mas para manter a simplicidade, usaremos o global
    setIsLoading(true); 
    setError('');
    setSuccess('');
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError("Usuário não autenticado. Faça o login novamente.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/delete?g_file_id=${g_file_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Falha ao deletar o arquivo.');
      }
      setDocuments(prevDocs => prevDocs.filter(doc => doc.g_file_id !== g_file_id));
      setSuccess(`"${docName}" foi deletado com sucesso!`);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funções para a área de Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };
  
  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="gerenciar-base-container">
      <div 
        className={`drag-drop-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <FiUploadCloud className="upload-icon" />
        <h2>Arraste & Solte</h2>
        <p>ou clique para selecionar do seu dispositivo</p>
        <span>Apenas arquivos .PDF</span>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isLoading}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
      </div>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="file-list-container">
        {/* Renderiza o arquivo selecionado para upload */}
        {file && (
          <div className="file-item upload-item">
            <div className="file-info">
              <FiFileText className="file-icon" />
              <span className="file-name">{file.name}</span>
            </div>
            <div className="file-actions">
              {isLoading ? (
                <div className="loader">Enviando...</div>
              ) : (
                <button onClick={handleUpload} className="upload-button">
                  Fazer Upload
                </button>
              )}
            </div>
          </div>
        )}

        {/* Renderiza a lista de documentos já existentes */}
        {isFetching ? (
          <p className="loading-text">Carregando documentos...</p>
        ) : (
          documents.length > 0 && documents.map(doc => (
            <div key={doc.g_file_id} className="file-item">
              <div className="file-info">
                <FiCheckCircle className="file-icon completed" />
                <a href={doc.shared_link} target="_blank" rel="noopener noreferrer" className="file-name">
                  {doc.name}
                </a>
              </div>
              <div className="file-actions">
                <button 
                  onClick={() => handleDelete(doc.g_file_id, doc.name)} 
                  disabled={isLoading}
                  className="delete-button"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
        
        {!isFetching && documents.length === 0 && !file && (
           <p className="loading-text">Nenhum documento na base de conhecimento.</p>
        )}
      </div>
    </div>
  );
}