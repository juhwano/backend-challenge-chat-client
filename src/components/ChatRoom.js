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
  const [chatResponse, setChatResponse] = useState({});
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [hasLeft, setHasLeft] = useState(false);
  const [otherUserId, setOtherUserId] = useState(null);
  const userName = localStorage.getItem('userName');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchMessages = async () => {
      const chatResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats/${number}`);
      const messageResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/messages/${chatResponse.data._id}`);
      setChatResponse(chatResponse.data);
      setMessages(messageResponse.data);

      // Extract other user's information if it's a 1:1 chat
      if (chatResponse.data.isPersonal) {
        const otherUserId = chatResponse.data.users.find((user) => user !== userId);
        if (otherUserId) {
          setOtherUserId(otherUserId);
        }
      }
    };

    fetchMessages();

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
  }, [number, chatId, location.state.chatId, hasLeft, userId]);

  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage) {
      alert('메시지 내용을 입력해주세요.');
      return;
    }

    const message = {
      chatId,
      chatNumber: number,
      from: userId,
      fromUserName: userName,
      content: inputMessage,
      ...(otherUserId && { to: otherUserId })
    };

    socket.emit('sendMessage', message);
    setInputMessage('');
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', { chatId, number, userId, userName });
    setHasLeft(true);
    navigate('/');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-room">
      <h1>{chatResponse.chatName}</h1>
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
          placeholder="Type your message"
        />
        <button onClick={handleSendMessage}>전송</button>
        <button className="leave-room-button" onClick={handleLeaveRoom}>
          나가기
        </button>
      </section>
    </div>
  );
}

export default ChatRoom;
