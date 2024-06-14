// Header.js
import React, { useEffect, useState } from "react";
import '../style/header.css'
import { useNavigate } from 'react-router-dom'; 

function Header() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const [totalWorks, setTotalWorks] = useState(0); // Khởi tạo totalWorks với giá trị mặc định là 0
  const [totalCreateWorks, setTotalCreateWorks] = useState(0);
  const [totalHiddenWorks, setTotalHiddenWorks] = useState(0);
  const [totaUpdateWorks, setTotalUpdateWorks] = useState(0);
  useEffect(() => {
      // Lấy giá trị name từ sessionStorage khi component được tạo ra
      const storedName = sessionStorage.getItem('name');
      const storedTotalWorks = sessionStorage.getItem('totalWorks'); // Lấy giá trị totalWorks từ sessionStorage
      const storedTotalCreateWorks = sessionStorage.getItem('totalCreateWorks');
      const storedTotalHiddenWorks = sessionStorage.getItem('totalHiddenWorks');
      const storedTotalUpdateWorks = sessionStorage.getItem('totalWorksUpdate');
      if (storedName) {
          setName(storedName);
      }
      if (storedTotalWorks) {
        setTotalWorks(parseInt(storedTotalWorks)); // Chuyển đổi totalWorks từ chuỗi sang số nguyên
    }
    if (storedTotalCreateWorks) {
      setTotalCreateWorks(parseInt(storedTotalCreateWorks)); // Chuyển đổi totalWorks từ chuỗi sang số nguyên
  }
  if (storedTotalHiddenWorks) {
    setTotalHiddenWorks(parseInt(storedTotalHiddenWorks)); 
  }
    if (storedTotalUpdateWorks) {
      setTotalUpdateWorks(parseInt(storedTotalUpdateWorks)); 
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
          {/* <li><a className="menu" style={{color:'white'}} href="/work-interface">Đăng ký bản quyền</a></li> */}
          {/* <li><a className="menu" style={{color:'white'}} href="/work-list-admin">Các bản quyền hiện có ({totalWorks})</a></li>
          <li><a className="menu" style={{color:'white'}} href="/create-list-admin">Duyệt đăng ký bản quyền ({totalCreateWorks})</a></li>
          <li><a className="menu" style={{color:'white'}} href="/update-list-admin">Duyệt chỉnh sửa bản quyền ({totaUpdateWorks})</a></li>
          <li><a className="menu" style={{color:'white'}} href="/hidden-work-admin">Bản quyền bị ẩn ({totalHiddenWorks})</a></li> */}


          <li><a className="menu" style={{color:'white'}} href="/work-list-admin">Các bản quyền hiện có</a></li>
          <li><a className="menu" style={{color:'white'}} href="/create-list-admin">Duyệt đăng ký bản quyền</a></li>
          <li><a className="menu" style={{color:'white'}} href="/update-list-admin">Duyệt chỉnh sửa bản quyền</a></li>
          <li><a className="menu" style={{color:'white'}} href="/hidden-work-admin">Bản quyền bị ẩn</a></li>
          {/* <li><a className="menu" style={{color:'white'}} href="/log-list">Lịch sử hoạt động</a></li> */}
          {/* <li><a className="menu" style={{color:'white'}} href="/user-list">Danh sách người dùng</a></li> */}
        </ul>
      </nav>
      <div className="greeting"> Chào,{name}!</div>
      <div style={{right:'7px'}} className="logout"><a onClick={handleLogout}>Đăng xuất</a></div>
    </div>
  </header>
  );
}

export default Header;
