import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import CreateGroupChatModal from '../components/CreateGroupChatModal';
import '../style/Home.css';

const socket = io('http://localhost:5050');

function Home() {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5050/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users', error);
      }
    };

    fetchChats();
    fetchUsers();

    // 채팅방 리스트와 사용자 리스트 새로고침
    const intervalId = setInterval(() => {
      fetchChats();
      fetchUsers();
    }, 5000);

    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setUserName(savedUserName);
      setIsLoggedIn(true);
      socket.emit('register', savedUserName);
    }

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      socket.on('new1to1chat', (chat) => {
        navigate(`/chats/${chat.number}`);
      });
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5050/login', { userName });
      if (response.data) {
        localStorage.setItem('userName', userName);
        setIsLoggedIn(true);
        socket.emit('register', userName);
      }
    } catch (error) {
      console.error('Login error', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5050/logout', { userName });
      if (response.data) {
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setUserName('');
      }
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  const handleJoinChat = (number) => {
    if (isLoggedIn) {
      navigate(`/chats/${number}`);
    } else {
      alert('채팅방 입장 전 로그인을 먼저 해주세요');
    }
  };

  const handleJoinUserChat = async (user) => {
    if (isLoggedIn) {
      try {
        const response = await axios.post('http://localhost:5050/chats', {
          chatName: `${user}님과의 1:1 채팅`,
          isPersonal: true,
          owner: userName,
          user
        });
        const chat = response.data;
        navigate(`/chats/${chat.number}`);
      } catch (error) {
        console.error('Error creating 1:1 chat', error);
      }
    } else {
      alert('1:1 채팅 시작 전 로그인을 먼저 해주세요');
    }
  };

  const handleRoomCreated = (chat) => {
    navigate(`/chats/${chat.number}`);
  };

  return (
    <div className="chats-and-login-container">
      <div className="chats-container">
        <h2>채팅방</h2>
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>종류</th>
              <th>방장</th>
              <th>생성일</th>
              <th>인원</th>
            </tr>
          </thead>
          <tbody>
            {chats.map((chat) => (
              <tr key={chat._id} onClick={() => handleJoinChat(chat.number)} style={{ cursor: 'pointer' }}>
                <td>{chat.number}</td>
                <td>{chat.chatName}</td>
                <td>{chat.isPersonal ? '1:1' : '그룹'}</td>
                <td>{chat.owner.userName}</td> {/* Display owner’s username */}
                <td>{new Date(chat.createdAt).toLocaleDateString()}</td>
                <td>{chat.users.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="login-container">
        <h2>로그인</h2>
        {isLoggedIn ? (
          <>
            <span>반갑습니다</span>
            <p>{userName} 님!</p>
            <button className="leave-button" onClick={handleLogout}>
              로그아웃
            </button>
            <button className="create-room-button" onClick={() => setIsModalOpen(true)}>
              채팅방 생성
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="사용하실 닉네임을 입력해주세요"
            />
            <button onClick={handleLogin}>로그인</button>
          </>
        )}
        <div className="users-container">
          <h2>접속 사용자</h2>
          <ul>
            {users
              .filter((user) => user !== userName)
              .map((user) => (
                <li key={user}>
                  <span>{user}</span>
                  <button className="chat-button" onClick={() => handleJoinUserChat(user)}>
                    1:1 채팅하기
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </div>
      {isModalOpen && <CreateGroupChatModal onClose={() => setIsModalOpen(false)} onRoomCreated={handleRoomCreated} />}
    </div>
  );
}

export default Home;
