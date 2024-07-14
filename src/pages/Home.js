import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateGroupChatModal from '../components/CreateGroupChatModal';
import '../style/Home.css';

function Home() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserId = localStorage.getItem('userId');

    if (storedUserName || storedUserId) {
      setUserName(storedUserName);
      setUserId(storedUserId);
      setIsLoggedIn(true);
    }

    fetchChats();
    fetchUsers();
  }, []);

  const fetchChats = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats`);
    setChats(response.data);
  };

  const fetchUsers = async () => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users`);
    setUsers(response.data);
  };

  const handleLogin = async () => {
    try {
      const user = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { userName });
      localStorage.setItem('userName', user.data.userName);
      setUserId(user.data.userId);
      localStorage.setItem('userId', user.data._id);
      setUserName(user.data.userName);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const userName = localStorage.getItem('userName');
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/logout`, { userName });
      localStorage.removeItem('userName');
      localStorage.removeItem('userId');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleJoinChat = (chatId, chatNumber) => {
    console.log('chatId, chatNumber: ', chatId, chatNumber);
    localStorage.setItem('currentChatId', chatId);
    localStorage.setItem('currentChatNumber', chatNumber);
    navigate(`/chats/${chatNumber}`, { state: { chatId, chatNumber } });
  };

  const handleJoinUserChat = async (user) => {
    try {
      const owner = localStorage.getItem('userId');
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chats`, {
        chatName: `1:1 with ${user.userName}`,
        isPersonal: true,
        owner,
        users: [user._id]
      });
      handleJoinChat(response.data._id, response.data.number);
    } catch (error) {
      console.error('Error starting 1:1 chat:', error);
    }
  };

  const filteredUsers = users.filter((user) => user.userName !== localStorage.getItem('userName'));

  return (
    <div className="home">
      <h1>Chat Application</h1>
      <div className="chat-list">
        <h2>Chat Rooms</h2>
        <table>
          <thead>
            <tr>
              <th>Number</th>
              <th>Name</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Created At</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((chat) => (
              <tr key={chat._id} onClick={() => handleJoinChat(chat._id, chat.number)} style={{ cursor: 'pointer' }}>
                <td>{chat.number}</td>
                <td>{chat.chatName}</td>
                <td>{chat.isPersonal ? '1:1' : 'Group'}</td>
                <td>{chat.owner.userName}</td>
                <td>{new Date(chat.createdAt).toLocaleDateString()}</td>
                <td>{chat.users.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="login-container">
        <h2>Login</h2>
        {isLoggedIn ? (
          <>
            <span>Welcome</span>
            <p>{userName}!</p>
            <button className="exit-button" onClick={handleLogout}>
              Logout
            </button>
            <button className="create-room-button" onClick={() => setIsModalOpen(true)}>
              Create Chat Room
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your username"
            />
            <button onClick={handleLogin}>Login</button>
          </>
        )}
        <div className="users-container">
          <h2>Waiting Users</h2>
          <ul>
            {filteredUsers.map((user) => (
              <li key={user._id}>
                <span>{user.userName}</span>
                <button className="chat-button" onClick={() => handleJoinUserChat(user)}>
                  1:1 Chat
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {isModalOpen && <CreateGroupChatModal onClose={() => setIsModalOpen(false)} onRoomCreated={fetchChats} />}
    </div>
  );
}

export default Home;
