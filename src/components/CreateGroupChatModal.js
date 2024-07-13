import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/CreateGroupChatModal.css';

function CreateGroupChatModal({ onClose }) {
  const [chatName, setChatName] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    try {
      const owner = localStorage.getItem('userName');
      const response = await axios.post('http://localhost:5050/chats', { chatName, isPersonal: false, owner });
      if (response.data) {
        onClose();
        sessionStorage.setItem('currentChatNumber', response.data.number);
        navigate(`/chats/${response.data.number}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>채팅방 생성</h2>
        <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} placeholder="제목" />
        <button className="create-button" onClick={handleCreateRoom}>
          확인
        </button>
        <button className="cancel-button" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
}

export default CreateGroupChatModal;
