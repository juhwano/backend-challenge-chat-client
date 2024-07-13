// src/pages/Chats.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Chats.css';

function Chats() {
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:5050/chats');
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats', error);
      }
    };

    fetchChats();
  }, []);

  const handleJoinChat = (number) => {
    navigate(`/chats/${number}`);
  };

  return (
    <div>
      <h2>Chats</h2>
      <table>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>방</th>
            <th>생성일</th>
            <th>인원</th>
          </tr>
        </thead>
        <tbody>
          {chats.map((chat) => (
            <tr key={chat._id} onClick={() => handleJoinChat(chat.number)} style={{ cursor: 'pointer' }}>
              <td>{chat.number}</td>
              <td>{chat.chatName}</td>
              <td>{chat.isPersonal ? '1:1 대화' : '단체 대화'}</td>
              <td>{new Date(chat.createdAt).toLocaleDateString()}</td>
              <td>{chat.users.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Chats;
