import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import '../style/ChatRoom.css';

const socket = io('http://localhost:5050');

function ChatRoom() {
  const { number } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [chatName, setChatName] = useState('');

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    sessionStorage.setItem('currentChatNumber', number);

    // 이전 대화 내역 불러오기
    const fetchMessages = async () => {
      try {
        const chatResponse = await axios.get(`http://localhost:5050/chats/${number}`);
        const chat = chatResponse.data;
        setChatName(chat.chatName);

        const messagesResponse = await axios.get(`http://localhost:5050/messages/${chat._id}`);
        setMessages(messagesResponse.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    socket.emit('joinChat', { number, userName });

    socket.on('joinedChat', (chat) => {
      setChatName(chat.chatName);
      console.log(`Joined chat: ${chat.chatName}`);
    });

    socket.on('newMessage', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('connectedUsers', (users) => {
      setUsers(users);
    });

    return () => {
      const currentChatNumber = sessionStorage.getItem('currentChatNumber');
      if (currentChatNumber === number) {
        sessionStorage.removeItem('currentChatNumber');
        socket.emit('leaveChat', { number, userName });
      }
      socket.off('joinedChat');
      socket.off('newMessage');
      socket.off('connectedUsers');
    };
  }, [number]);

  useEffect(() => {
    // 최하단 스크롤 이동
    const messagesEndRef = document.getElementById('messagesEnd');
    if (messagesEndRef) {
      messagesEndRef.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    const userName = localStorage.getItem('userName');
    if (message.trim()) {
      socket.emit('sendMessage', {
        from: userName,
        number: number,
        content: message.trim(),
        chatType: 'group',
        sequence: messages.length + 1
      });
      setMessage('');
    } else {
      alert('메시지를 입력해주세요.');
    }
  };

  const handleLeaveRoom = () => {
    const userName = localStorage.getItem('userName');
    socket.emit('leaveChat', { number, userName });
    sessionStorage.removeItem('currentChatNumber');
    navigate('/');
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h2>{chatName}</h2>
        <button className="exit-button" onClick={handleLeaveRoom}>
          나가기
        </button>
      </div>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${
                msg.fromUserName === 'System'
                  ? 'system-message'
                  : msg.fromUserName === localStorage.getItem('userName')
                  ? 'my-message'
                  : 'other-message'
              }`}
            >
              <strong>{msg.fromUserName || 'System'}: </strong>
              {msg.content}
            </div>
          ))}
          <div id="messagesEnd" />
        </div>
        <div className="chat-sidebar">
          <h3>참여자</h3>
          <ul>
            {users.map((user, index) => (
              <li key={index}>
                {user.active ? '🟢' : '🔴'} {user.userName}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력해주세요."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
