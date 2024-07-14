import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import '../style/ChatRoom.css';

const socket = io(process.env.REACT_APP_BACKEND_URL);

function ChatRoom() {
  const { number } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { chatId, chatNumber } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [hasLeft, setHasLeft] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const chatResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats/${number}`);
      console.log('chatResponse: ', chatResponse.data);
      const messageResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/messages/${chatResponse.data._id}`);
      setMessages(messageResponse.data);
    };

    fetchMessages();

    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    socket.emit('joinRoom', { chatId: chatId || location.state.chatId, number, userId, userName });

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    const handleBeforeUnload = () => {
      if (!hasLeft) {
        socket.emit('leaveRoom', { chatId: chatId || location.state.chatId, number, userId, userName });
        setHasLeft(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socket.off();
    };
  }, [number, chatId, location.state.chatId, hasLeft]);

  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage) {
      alert('메시지 내용을 입력해주세요.');
      return;
    }

    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    const message = { chatId, chatNumber: number, from: userId, fromUserName: userName, content: inputMessage };
    socket.emit('sendMessage', message);
    setInputMessage('');
  };

  const handleLeaveRoom = () => {
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    socket.emit('leaveRoom', { chatId, number, userId, userName });
    setHasLeft(true);
    navigate('/');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const userName = localStorage.getItem('userName');

  return (
    <div className="chat-room">
      <section className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.fromUserName === 'system'
                ? 'system-message'
                : msg.fromUserName === userName
                ? 'user-message'
                : 'other-message'
            }`}
          >
            {msg.fromUserName === 'system' ? (
              <span>
                <strong>System</strong>: {msg.toUserName}님 {msg.content}
              </span>
            ) : (
              <span>
                <strong>{msg.fromUserName}</strong>: {msg.content}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </section>
      <section className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
        <button className="leave-room-button" onClick={handleLeaveRoom}>
          Leave Room
        </button>
      </section>
    </div>
  );
}

export default ChatRoom;
