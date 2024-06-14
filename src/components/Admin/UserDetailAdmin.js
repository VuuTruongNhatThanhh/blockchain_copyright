import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import UserContract from '../../abis/User.json';
import MarketplaceContract from '../../abis/Marketplace.json';
import '../style/userdetail.css';

const UserDetailAdmin = () => {
    const formatBirthYear = (birthYear) => {
        const [year, month, day] = birthYear.split('-');
        return `${day}-${month}-${year}`;
      };
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [works, setWorks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [worksPerPage] = useState(5);
    const [searchKeyword, setSearchKeyword] = useState('');
    const navigate = useNavigate()
    useEffect(() => {

        const role = sessionStorage.getItem('role');
        if (role === '0' || role === null) {
          alert("Bạn không có quyền truy cập trang này");
          navigate('/'); // Chuyển hướng về trang chủ hoặc trang đăng nhập
          return;
        }
        const loadUserDetail = async () => {
            if (!window.ethereum) {
                alert("Please install MetaMask to interact with Ethereum");
                return;
            }

            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const networkId = await web3.eth.net.getId();
            const networkData = UserContract.networks[networkId];
            const marketplaceContractData = MarketplaceContract.networks[networkId];
            const contract = new web3.eth.Contract(UserContract.abi, networkData.address);
            const marketplaceContract = new web3.eth.Contract(MarketplaceContract.abi, marketplaceContractData.address);

            try {
                const result = await contract.methods.getUser(userId).call();
                const userDetail = {
                    username: result[1],
                    name: result[3],
                    citizenID: result[4],
                    birthDay: result[6],
                    email: result[7],
                    role: result[5]
                };
                setUser(userDetail);
                let tempWorks = [];
                const userWorks = await marketplaceContract.methods.getWorksByUserId(userId).call();
                const processedWorks = userWorks.map(work => ({
                    id: parseInt(work.id),
                    title: work.title,
                    yearCreate: parseInt(work.yearCreate),
                    describe: work.describe,
                    category: work.category,
                    nameCreator: work.nameCreator,
                    status: parseInt(work.status),
                    userId: parseInt(work.userId)
                }))
                .filter(work => work.status === 3);
                setWorks(processedWorks);

                setLoading(false);
            } catch (error) {
                console.error("Error loading user detail:", error);
                alert("Failed to load user detail. Please check the console for details.");
                setLoading(false);
            }
        };

        loadUserDetail();
    }, [userId]);

    const indexOfLastWork = currentPage * worksPerPage;
    const indexOfFirstWork = indexOfLastWork - worksPerPage;
    const currentWorks = works.slice(indexOfFirstWork, indexOfLastWork);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleSearch = (e) => {
        const keyword = e.target.value.toLowerCase();
        setSearchKeyword(keyword);
      };

      const getDisplayedWorks = () => {
        const filteredWorks = works.filter(work =>
            work.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            work.nameCreator.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        return filteredWorks.slice(indexOfFirstWork, indexOfLastWork);
    };

       const filteredWorks = works.filter(work =>
        work.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        work.nameCreator.toLowerCase().includes(searchKeyword.toLowerCase())
    );
      

    

    return (
        <div className="user-detail-container">
            {loading ? (
                <div className="loading">Loading user detail...</div>
            ) : !user ? (
                <div className="user-not-found">User not found</div>
            ) : (
                <>
                    <h2>{user.name}</h2>
                    <p><strong>Tên tài khoản:</strong> {user.username}</p>
                    <p><strong>Số CCCD:</strong> {user.citizenID}</p>
                    <p><strong>Ngày sinh:</strong> {formatBirthYear(user.birthDay)}</p>
                    <p><strong>Email:</strong> {user.email}</p>

                    <div style={{marginTop:'50px'}}>
                        <h5>Các tác phẩm đã đăng ký bản quyền</h5>
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchKeyword}
                            onChange={handleSearch} style={{width:'40%'}}
                        />
                        <table>
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên tác phẩm</th>
                                    <th>Năm sáng tác</th>
                                    <th>Thể loại</th>
                                    {/* <th>Tên tác giả</th> */}
                                </tr>
                            </thead>
                            <tbody>
                            {getDisplayedWorks().map((work, index) => (
  <tr key={index}>
    <td>{work.id+1}</td>
    <td><Link to={`/work/${work.id}`}>{work.title}</Link></td>
    <td>{work.yearCreate}</td>
    <td>{work.category}</td>
    {/* <td>{work.nameCreator}</td> */}
  </tr>
))}
                            </tbody>
                        </table>
                        <ul className="pagination">
                            {Array.from({ length: Math.ceil(filteredWorks.length / worksPerPage) }).map((_, index) => (
                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                    <button onClick={() => paginate(index + 1)} className="page-link">{index + 1}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserDetailAdmin;
