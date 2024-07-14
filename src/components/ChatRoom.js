import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import '../style/ChatRoom.css';

const socket = io(process.env.REACT_APP_BACKEND_URL);

function ChatRoom() {
  const { number } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats/${number}/messages`);
      setMessages(response.data);
    };

    fetchMessages();
    socket.emit('joinRoom', number);

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.emit('leaveRoom', number);
      socket.off();
    };
  }, [number]);

  const handleSendMessage = () => {
    const userName = localStorage.getItem('userName');
    const message = { chatNumber: number, sender: userName, content: inputMessage };
    socket.emit('sendMessage', message);
    setInputMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.sender}</strong>: {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default ChatRoom;
