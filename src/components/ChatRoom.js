import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import '../style/ChatRoom.css';

const socket = io(process.env.REACT_APP_BACKEND_URL);

function ChatRoom() {
  const { number } = useParams();
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const messageResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats/${number}/messages`); // Previous message history
      const chatResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats/${number}`); // Room info
      console.log('chatResponse: ', chatResponse);
      setMessages(messageResponse.data);
      setChatId(chatResponse.data.id);
      console.log('chatResponse.data.id: ', chatResponse.data.id);
    };

    fetchMessages();

    const userName = localStorage.getItem('userName');
    socket.emit('joinRoom', { number, userName, chatId });

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.emit('leaveRoom', { number, userName });
      socket.off();
    };
  }, [number]);

  const handleSendMessage = () => {
    const userName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');
    const message = { chatId, chatNumber: number, from: userId, fromUserName: userName, content: inputMessage };
    socket.emit('sendMessage', message);
    setInputMessage('');
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
      </section>
    </div>
  );
}

export default ChatRoom;
