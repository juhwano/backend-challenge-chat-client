import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreateGroupChatModal from '../components/CreateGroupChatModal';
import '../style/Home.css';

function Home() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [oneToOneChats, setOneToOneChats] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserId = localStorage.getItem('userId');

    if (storedUserName && storedUserId) {
      setUserName(storedUserName);
      setUserId(storedUserId);
      setIsLoggedIn(true);
      fetchChats(storedUserId);
    } else {
      fetchChats();
    }

    const interval = setInterval(() => {
      const id = storedUserId || localStorage.getItem('userId');
      fetchChats(id);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchChats = async (userId) => {
    try {
      const groupResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats`);
      setGroupChats(groupResponse.data);

      if (userId) {
        const oneToOneResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats/one-to-one/${userId}`);
        setOneToOneChats(oneToOneResponse.data);
      } else {
        setOneToOneChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/login`, { userName });
      localStorage.setItem('userName', user.data.userName);
      setUserId(user.data.userId);
      localStorage.setItem('userId', user.data._id);
      setUserName(user.data.userName);
      setIsLoggedIn(true);
      fetchChats(user.data._id);
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
      setOneToOneChats([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleJoinChat = async (chatNumber) => {
    if (!isLoggedIn) {
      alert('로그인 후 채팅방에 참여할 수 있습니다.');
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chats/${chatNumber}`);
      const users = response.data.users;
      if (users.length === 100) {
        alert('그룹 채팅은 최대 100명까지 가능합니다.');
        return;
      }
      const chatId = response.data._id;
      localStorage.setItem('currentChatId', chatId);
      localStorage.setItem('currentChatNumber', chatNumber);
      navigate(`/chats/${chatNumber}`, { state: { chatId, chatNumber } });
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  const handleJoinUserChat = async (user) => {
    if (!isLoggedIn) {
      alert('로그인 후 1:1 채팅을 신청할 수 있습니다.');
      return;
    }

    try {
      const owner = localStorage.getItem('userId');
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chats`, {
        chatName: `${localStorage.getItem('userName')}님이 신청한 ${user.userName}님과 1:1 채팅`,
        isPersonal: true,
        owner,
        users: [owner, user._id]
      });
      handleJoinChat(response.data.number);
    } catch (error) {
      console.error('Error starting 1:1 chat:', error);
    }
  };

  const handleSearch = async () => {
    if (!isLoggedIn) {
      alert('로그인 후 사용자 검색이 가능합니다.');
      return;
    }

    if (searchQuery) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/search?query=${searchQuery}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="home">
      <div className="chat-list">
        <h1>1:1 채팅 목록</h1>
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>생성자</th>
              <th>생성일</th>
            </tr>
          </thead>
          <tbody>
            {oneToOneChats.map((chat) => (
              <tr key={chat._id} onClick={() => handleJoinChat(chat.number)} style={{ cursor: 'pointer' }}>
                <td>{chat.number}</td>
                <td>{chat.chatName}</td>
                <td>{chat.owner.userName}</td>
                <td>{new Date(chat.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="chat-list">
        <h1>그룹 채팅 목록</h1>
        <table>
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>생성자</th>
              <th>생성일</th>
              <th>인원</th>
            </tr>
          </thead>
          <tbody>
            {groupChats.map((chat) => (
              <tr key={chat._id} onClick={() => handleJoinChat(chat.number)} style={{ cursor: 'pointer' }}>
                <td>{chat.number}</td>
                <td>{chat.chatName}</td>
                <td>{chat.owner.userName}</td>
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
            <span>환영합니다</span>
            <p>
              <strong>{userName}</strong>
            </p>
            <button className="exit-button" onClick={handleLogout}>
              로그아웃
            </button>
            <button className="create-room-button" onClick={() => setIsModalOpen(true)}>
              그룹 채팅방 생성
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="채팅에 사용할 닉네임을 입력해주세요."
            />
            <button onClick={handleLogin}>로그인</button>
          </>
        )}
        <div className="search-container">
          <h2>사용자 검색</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색할 유저의 닉네임을 입력해주세요."
            disabled={!isLoggedIn} // Disable if not logged in
          />
          <button onClick={handleSearch} disabled={!isLoggedIn}>
            검색
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>검색 결과</h3>
            <ul>
              {searchResults.map((user) => (
                <li key={user._id}>
                  <div className="user-status">
                    <div className={`status-circle ${user.active ? 'online' : 'offline'}`}></div>
                    <span>
                      {user.userName} ({user.active ? 'Online' : 'Offline'})
                    </span>
                  </div>
                  <button className="chat-button" onClick={() => handleJoinUserChat(user)} disabled={!isLoggedIn}>
                    1:1 채팅하기
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {isModalOpen && (
        <CreateGroupChatModal onClose={() => setIsModalOpen(false)} onRoomCreated={() => fetchChats(userId)} />
      )}
    </div>
  );
}

export default Home;
