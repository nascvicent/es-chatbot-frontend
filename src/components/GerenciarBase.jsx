import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiUploadCloud, FiFileText, FiTrash2, FiChevronLeft, FiChevronRight, FiCalendar, FiUser } from 'react-icons/fi';
import "../styles/GerenciadorBase.css";

const API_URL = `${import.meta.env.VITE_API_URL}`;

export default function GerenciarBase() {
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const PAGE_SIZE = 5;

  // Efeito para avisar o usuário antes de sair da página durante o upload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Exibe um prompt de confirmação padrão do navegador
      event.preventDefault();
      // Necessário para o Chrome
      event.returnValue = '';
    };

    if (isLoading) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    // Função de limpeza para remover o listener caso o componente seja desmontado
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoading]); // Este efeito depende apenas do estado de 'isLoading'

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const fetchDocuments = useCallback(async (page) => {
    setIsFetching(true);
    setError('');
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError("Autenticação necessária.");
        setIsFetching(false);
        return;
    }

    try {
      const response = await fetch(`${API_URL}/document?page=${page}&page_size=${PAGE_SIZE}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setDocuments([]);
          setTotalPages(1);
          setTotalDocuments(0);
          return;
        }
        throw new Error('Falha ao buscar os documentos.');
      }

      const data = await response.json();
      setDocuments(data.documents);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
      setTotalDocuments(data.total);

    } catch (err) {
      setError('Não foi possível carregar a lista de documentos.');
      console.error(err);
      setDocuments([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [fetchDocuments, currentPage]);

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
      const response = await fetch(`${API_URL}/document/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Falha no upload do arquivo.');
      }
      const newDocument = await response.json();
      setFile(null); 
      setSuccess(`"${newDocument.name}" foi adicionado com sucesso!`);
      if (currentPage !== 1) {
          setCurrentPage(1);
      } else {
          fetchDocuments(1);
      }
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
      const response = await fetch(`${API_URL}/document/delete?g_file_id=${g_file_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Falha ao deletar o arquivo.');
      }

      if (documents.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchDocuments(currentPage);
      }
      setSuccess(`"${docName}" foi deletado com sucesso!`);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if(isLoading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if(isLoading) return;
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const openFileDialog = () => {
    if(isLoading) return;
    fileInputRef.current.click();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="gerenciar-base-container">
      <div
        className={`drag-drop-area ${isDragging ? 'dragging' : ''} ${isLoading ? 'disabled' : ''}`}
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
        {file && (
          <div className={`file-item upload-item ${isLoading ? 'uploading' : ''}`}>
            <div className="file-icon-wrapper">
                <FiFileText className="file-icon-pdf" />
            </div>
            <div className='file-details'>
                <span className="file-name">{file.name}</span>
            </div>
            <div className="file-actions">
              {isLoading ? (
                <div className="upload-in-progress">
                  <div className="spinner"></div>
                  <div className="upload-status-text">
                      <p>Enviando e processando...</p>
                      <span>Isso pode levar alguns minutos.</span>
                  </div>
                </div>
              ) : (
                <button onClick={handleUpload} className="upload-button">
                  Fazer Upload
                </button>
              )}
            </div>
          </div>
        )}

        {isFetching ? (
          <p className="loading-text">Carregando documentos...</p>
        ) : (
          documents.length > 0 ? (
              documents.map(doc => (
                <div key={doc.g_file_id} className="file-item">
                  <div className="file-icon-wrapper">
                    <FiFileText className="file-icon-pdf" />
                  </div>
                  <div className="file-details">
                    <a href={doc.shared_link} target="_blank" rel="noopener noreferrer" className="file-name" title={doc.name}>
                      {doc.name}
                    </a>
                    <div className="file-meta">
                      <span className="file-meta-item">
                        <FiCalendar size={14} /> {formatDate(doc.created_at)}
                      </span>
                      <span className="file-meta-item">
                        <FiUser size={14} /> {doc.user_email}
                      </span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button
                      onClick={() => handleDelete(doc.g_file_id, doc.name)}
                      disabled={isLoading}
                      className="delete-button"
                      title={`Deletar ${doc.name}`}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))
          ) : (
            !file && <p className="loading-text">Nenhum documento na base de conhecimento.</p>
          )
        )}
      </div>

      {!isFetching && totalDocuments > 0 && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading || isFetching}
            className="pagination-button"
          >
            <FiChevronLeft /> Anterior
          </button>
          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading || isFetching}
            className="pagination-button"
          >
            Próxima <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}