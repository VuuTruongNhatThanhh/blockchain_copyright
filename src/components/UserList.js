import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import UserContract from '../abis/User.json';
import './style/userlist.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [searchKeyword, setSearchKeyword] = useState('');
  const formatBirthYear = (birthYear) => {
    const [year, month, day] = birthYear.split('-');
    return `${day}-${month}-${year}`;
  };
  useEffect(() => {
    const loadUsers = async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask to interact with Ethereum");
        return;
      }

      const web3 = new Web3(window.ethereum);

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const networkId = await web3.eth.net.getId();
        const networkData = UserContract.networks[networkId];
        const userContract = new web3.eth.Contract(
          UserContract.abi,
          networkData.address
        );

        const userCount = await userContract.methods.getUserCount().call();
        let tempUsers = [];
        for (let i = 1; i <= userCount; i++) {
          const user = await userContract.methods.getUser(i).call();
          const processedUser = {
            userId: parseInt(user[0]),
            username: user[1],
            name: user[3],
            citizenId: user[4],
            role: parseInt(user[5]),
            birthYear: user[6],
            email:user[7]
            // You can add more user attributes here if needed
          };
          tempUsers.push(processedUser);
        }
        setUsers(tempUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error loading users:", error);
        alert("Failed to load users. Please check the console for details.");
      }
    };

    loadUsers();
  }, []);

  

  // Hàm để chuyển đến trang mới
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (e) => {
    setSearchKeyword(e.target.value.toLowerCase());
    setCurrentPage(1); // Reset trang khi tìm kiếm
  };
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchKeyword) ||
    user.name.toLowerCase().includes(searchKeyword) ||
    user.citizenId.toLowerCase().includes(searchKeyword)
  );
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="userlist-container">
      <h4 style={{marginBottom:'10px'}}>Danh sách tác giả</h4>
      <input style={{width:'40%', height:'40px'}}
        type="text"
        placeholder="Tìm kiếm..."
        value={searchKeyword}
        onChange={handleSearch}
        className="search-input"
      />
      <table className="userlist-table">
        <thead>
          <tr>
            <th>STT</th>
            {/* <th>Tên tài khoản</th> */}
            <th>Tên tác giả</th>
            <th>Ngày sinh</th>
            <th>Email</th>
            {/* <th>Số CCCD</th> */}
            {/* <th>Vai trò</th> */}
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.userId}</td>
              {/* <td>{user.username}</td> */}
              <td>
              <a href={`/userdetail/${user.userId}`}>{user.name}</a>
                </td>
              <td>{formatBirthYear(user.birthYear)}</td>
              <td>{user.email}</td>
              {/* <td>{user.citizenId}</td> */}
              {/* <td>{user.role === 0 ? 'User' : 'Admin'}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Thêm phân trang */}
      <ul style={{justifyContent:'normal'}} className="pagination">
        {Array.from({ length: Math.ceil(users.length / usersPerPage) }).map((_, index) => (
          <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
            <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
