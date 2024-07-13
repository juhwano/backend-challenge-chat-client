import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateRoomModal from '../components/CreateRoomModal';
import '../style/Chats.css';
import '../style/Login.css';

function Home() {
  const [chats, setChats] = useState([]);
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

    fetchChats();

    // 채팅방 리스트 새로고침
    const intervalId = setInterval(fetchChats, 5000);

    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setUserName(savedUserName);
      setIsLoggedIn(true);
    }

    return () => clearInterval(intervalId);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5050/login', { userName });
      if (response.data) {
        localStorage.setItem('userName', userName);
        setIsLoggedIn(true);
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
      </div>
      {isModalOpen && <CreateRoomModal onClose={() => setIsModalOpen(false)} onRoomCreated={handleRoomCreated} />}
    </div>
  );
}

export default Home;
