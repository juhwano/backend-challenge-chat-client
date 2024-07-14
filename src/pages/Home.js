import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateGroupChatModal from '../components/CreateGroupChatModal';
import '../style/Home.css';

function Home() {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats`);
      setChats(response.data);
    };

    const fetchUsers = async () => {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users`);
      setUsers(response.data);
    };

    fetchChats();
    fetchUsers();
  }, []);

  const handleLogin = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { userName });
      localStorage.setItem('userName', userName);
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
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleJoinChat = (chatNumber) => {
    sessionStorage.setItem('currentChatNumber', chatNumber);
    window.location.href = `/chats/${chatNumber}`;
  };

  const handleJoinUserChat = async (user) => {
    try {
      const owner = localStorage.getItem('userName');
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chats`, {
        isPersonal: true,
        owner,
        users: [user._id]
      });
      handleJoinChat(response.data.number);
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
              <tr key={chat._id} onClick={() => handleJoinChat(chat.number)} style={{ cursor: 'pointer' }}>
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
            <button className="leave-button" onClick={handleLogout}>
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
      {isModalOpen && <CreateGroupChatModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

export default Home;
