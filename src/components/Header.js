// Header.js
import React, { useEffect, useState } from "react";
import './style/header.css'
import { useNavigate, useParams, Link } from 'react-router-dom'; 

function Header() {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();
 
  useEffect(() => {
      // Lấy giá trị name từ sessionStorage khi component được tạo ra
      const storedName = sessionStorage.getItem('name');
      const storedUserId = sessionStorage.getItem('userId');

      if (storedName) {
          setName(storedName);
      }
      if (storedUserId) {
        setUserId(storedUserId);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('role')
    navigate('/'); // Sử dụng navigate để chuyển hướng đến trang login
  };
  return (
    <header style={{height: '50px', backgroundColor:'black'}} className="App-header">
    <div className="header-content">
      
      <nav id="nav">
        <ul style={{display:'flex', gap:'10px', listStyle:'none', color:'white',  color: 'white'}}>
        {/* <li><a className="menu" style={{color:'white'}} href="/login">Đăng nhập</a></li> */}
           <li><a className="menu" style={{color:'white'}} href="/work-list">Danh sách bản quyền</a></li>
          <li><a className="menu" style={{color:'white'}} href="/work-interface">Đăng ký bản quyền</a></li>
          <li><a className="menu" style={{color:'white'}} href="/user-list">Danh sách các tác giả</a></li>
          <li><a className="menu" style={{color:'white'}} href="/market/0000">Chuyển nhượng bản quyền</a></li>
          {/* <li><a className="menu" style={{color:'white'}} href="/log-list">Lịch sử</a></li> */}
          {/* <li><a className="menu" style={{color:'white'}} href="/user-list">Danh sách người dùng</a></li> */}
        </ul>
      </nav>
      <div className="greeting">Xin chào,<Link style={{color:'white'}} to={`/user-profile/${userId}`}>{name}!</Link></div>
      <div className="logout"><a onClick={handleLogout}>Đăng xuất</a></div>
    </div>
  </header>
  );
}

export default Header;
