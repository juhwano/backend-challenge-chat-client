import React, { useState } from 'react';
import axios from 'axios';
import '../style/CreateGroupChatModal.css';

function CreateGroupChatModal({ onClose, onRoomCreated }) {
  const [chatName, setChatName] = useState('');

  const handleCreateRoom = async () => {
    try {
      const owner = localStorage.getItem('userId');
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chats`, {
        chatName,
        isPersonal: false,
        owner
      });
      if (response.data) {
        onClose();
        onRoomCreated();
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Chat Room</h2>
        <input
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="Enter chat room name"
        />
        <button onClick={handleCreateRoom}>Create</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default CreateGroupChatModal;
