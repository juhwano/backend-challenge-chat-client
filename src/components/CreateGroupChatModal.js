import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/CreateGroupChatModal.css';

function CreateGroupChatModal({ onClose, onRoomCreated }) {
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
        onRoomCreated();
        navigate(`/chats/${response.data.number}`, {
          state: { chatId: response.data._id, chatNumber: response.data.number }
        });
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>그룹 채팅방 생성</h2>
        <input
          type="text"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="생성할 채팅방 이름을 입력해주세요."
        />
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
