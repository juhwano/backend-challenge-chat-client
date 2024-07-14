import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/CreateGroupChatModal.css';

function CreateGroupChatModal({ onClose }) {
  const [chatName, setChatName] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    try {
      const owner = localStorage.getItem('userId');
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chats`, {
        chatName,
        isPersonal: false,
        owner,
        users: [owner]
      });
      if (response.data) {
        onClose();
        localStorage.setItem('chatId', response.data.id);
        localStorage.setItem('chatNumber', response.data.number);
        navigate(`/chats/${response.data.number}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Chat Room</h2>
        <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} />
        <button onClick={handleCreateRoom}>Create</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default CreateGroupChatModal;
